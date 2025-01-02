import { Context } from "@netlify/functions";
import puppeteer, { Browser, Page } from "puppeteer";
import { checkCompany, insertCompany } from "../../model/company";
import { CONFIG } from "../../db/config";

// Helper function to configure Puppeteer
const launchBrowser = async (): Promise<Browser> => {
  return puppeteer.launch();
};

// Helper function to handle page navigation with retries
const navigateToPage = async (
  browser: Browser,
  url: string,
  retries = 3
): Promise<Page> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const page = await browser.newPage();
    try {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
      );
      await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
      await page.setRequestInterception(true);

      page.on("request", (req) => {
        if (
          ["image", "stylesheet", "font", "media"].includes(req.resourceType())
        ) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForSelector("body", { timeout: 60000 });

      console.log(`Navigation succeeded on attempt ${attempt}`);
      return page;
    } catch (error) {
      console.error(`Attempt ${attempt} to navigate to ${url} failed:`, error);
      await page.close();
      if (attempt === retries)
        throw new Error(`Navigation failed after ${retries} attempts`);
    }
  }
  throw new Error("Unexpected navigation failure");
};

// Main function for Netlify
export default async (
  request: Request,
  context: Context
): Promise<Response> => {
  let browser: Browser | null = null;

  try {
    const requestKey = request.headers.get("x-verification-code");
    const verificationCode = CONFIG.VERIFICATION_CODE;

    if (!verificationCode) {
      console.error("Missing VERIFICATION_CODE in environment variables");
      return new Response(
        JSON.stringify({ message: "Server misconfiguration.", status: false }),
        { status: 500 }
      );
    }

    if (verificationCode !== requestKey) {
      return new Response(
        JSON.stringify({ message: "Unauthorized access.", status: false }),
        { status: 401 }
      );
    }

    const body = await request.json();
    const url: string = body?.url;

    if (!url || !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(url)) {
      return new Response(
        JSON.stringify({ message: "Invalid URL parameter.", status: false }),
        { status: 400 }
      );
    }

    browser = await launchBrowser();
    const page = await navigateToPage(browser, url);

    const pageData = await page.evaluate(() => {
      const ogSiteName =
        document
          .querySelector('meta[property="og:title"]')
          ?.getAttribute("content") || "";
      const title = document.querySelector("title")?.innerText || "";

      const getAddress = (): string => {
        const addressElement = Array.from(document.querySelectorAll("p")).find(
          (p) => p.textContent?.toLowerCase().includes("address")
        );
        return addressElement?.textContent?.trim() || "";
      };

      return {
        companyLogo:
          document.querySelector('link[rel="icon"]')?.getAttribute("href") ||
          "",
        companyName: ogSiteName || title || "",
        description:
          document
            .querySelector('meta[name="description"]')
            ?.getAttribute("content") || "",
        address: getAddress(),
        phoneNumber:
          document
            .querySelector("a[href^='tel:']")
            ?.getAttribute("href")
            ?.replace("tel:", "") || "",
        emailAddress:
          document
            .querySelector("a[href^='mailto:']")
            ?.getAttribute("href")
            ?.replace("mailto:", "") || "",
        websiteUrl: window.location.href,
        facebookLink:
          document
            .querySelector("a[href*='facebook.com']")
            ?.getAttribute("href") || "",
        twitterLink:
          document
            .querySelector("a[href*='twitter.com']")
            ?.getAttribute("href") || "",
        linkedInUrl:
          document
            .querySelector("a[href*='linkedin.com']")
            ?.getAttribute("href") || "",
        youtubeLink:
          document
            .querySelector("a[href*='youtube.com']")
            ?.getAttribute("href") || "",
        instagramLink:
          document
            .querySelector("a[href*='instagram.com']")
            ?.getAttribute("href") || "",
      };
    });

    await page.close();

    const websiteUrl = pageData.websiteUrl;
    const exists = await checkCompany(websiteUrl);

    if (exists) {
      return new Response(
        JSON.stringify({ status: false, message: "Company already exists!" }),
        { status: 409 }
      );
    }

    const id = await insertCompany(
      pageData.companyLogo,
      pageData.companyName,
      pageData.description,
      pageData.address,
      pageData.phoneNumber,
      pageData.emailAddress,
      pageData.websiteUrl,
      pageData.facebookLink,
      pageData.twitterLink,
      pageData.linkedInUrl,
      pageData.youtubeLink,
      pageData.instagramLink
    );

    return new Response(
      JSON.stringify({
        status: true,
        message: "Company information saved successfully!",
        id: id,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error scraping the website:", error);
    return new Response(
      JSON.stringify({
        status: false,
        message: "Failed to scrape the website!",
      }),
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
