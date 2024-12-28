import { Context } from "@netlify/functions";
import chromium from "@sparticuz/chromium";
import puppeteer, { Browser, Page } from "puppeteer-core";
import { checkCompany, insertCompany } from "../../model/company";

// Set Chromium configuration for serverless environments
chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

// Helper function to handle navigation with retries
const navigateToPage = async (browser: Browser, url: string, retries = 3): Promise<Page> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const page = await browser.newPage();
    try {
      // Set user agent and headers to mimic real browser behavior
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
      );
      await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

      // Navigate to the URL
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

      // Wait for the body tag to ensure the page has loaded
      await page.waitForSelector("body", { timeout: 60000 });
      return page; // Navigation succeeded
    } catch (error) {
      console.error(`Attempt ${attempt} to navigate to ${url} failed:`, error);
      await page.close();
      if (attempt === retries) throw error; // Throw error after max retries
    }
  }
  throw new Error("Navigation failed after retries");
};

// Main function for Netlify
export default async (request: Request, context: Context): Promise<Response> => {
  try {
    // Parse request and headers
    const requestKey = request.headers.get("x-verification-code");
    const verificationCode = process.env.VERIFICATION_CODE || "";
    const body = await request.json();
    const url: string = body?.url;

    // Validate verification code
    if (verificationCode !== requestKey) {
      return new Response(
        JSON.stringify({ message: "Unauthorized access.", status: false }),
        { status: 401 }
      );
    }

    // Validate URL
    if (!url || !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(url)) {
      return new Response(
        JSON.stringify({ message: "Invalid URL parameter.", status: false }),
        { status: 400 }
      );
    }

    // Get Chromium executable path
    const chromiumPath = await chromium.executablePath();
    if (!chromiumPath) {
      throw new Error("Chromium executable path not found.");
    }

    console.log("Chromium Path:", chromiumPath);

    // Launch Puppeteer
    const browser: Browser = await puppeteer.launch({
      args: [...chromium.args, "--disable-dev-shm-usage"],
      defaultViewport: chromium.defaultViewport,
      executablePath: chromiumPath,
      headless: chromium.headless,
    });

    // Navigate to the page
    const page: Page = await navigateToPage(browser, url);

    // Scrape data
    const pageData = await page.evaluate(() => {
      const ogSiteName =
        document
          .querySelector('meta[property="og:title"]')
          ?.getAttribute("content") || "";
      const title = document.querySelector("title")?.innerText || "";

      const getAddress = (): string => {
        const addressElement = Array.from(
          document.querySelectorAll("p") || []
        ).find((p) => p.textContent?.toLowerCase().includes("address"));
        return addressElement?.textContent?.trim() || "";
      };

      const companyLogo =
        document.querySelector('link[rel="icon"]')?.getAttribute("href") || "";
      const companyName = ogSiteName || title || "";
      const description =
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") || "";
      const address = getAddress();
      const phoneNumber =
        document
          .querySelector("a[href^='tel:']")
          ?.getAttribute("href")
          ?.replace("tel:", "") || "";
      const emailAddress =
        document
          .querySelector("a[href^='mailto:']")
          ?.getAttribute("href")
          ?.replace("mailto:", "") || "";
      const websiteUrl = window.location.href;
      const facebookLink =
        document
          .querySelector("a[href*='facebook.com']")
          ?.getAttribute("href") || "";
      const twitterLink =
        document
          .querySelector("a[href*='twitter.com']")
          ?.getAttribute("href") || "";
      const linkedInUrl =
        document
          .querySelector("a[href*='linkedin.com']")
          ?.getAttribute("href") || "";
      const youtubeLink =
        document
          .querySelector("a[href*='youtube.com']")
          ?.getAttribute("href") || "";
      const instagramLink =
        document
          .querySelector("a[href*='instagram.com']")
          ?.getAttribute("href") || "";

      return {
        companyLogo,
        companyName,
        description,
        address,
        phoneNumber,
        emailAddress,
        websiteUrl,
        facebookLink,
        twitterLink,
        linkedInUrl,
        youtubeLink,
        instagramLink,
      };
    });

    await page.close();
    await browser.close();

    // Check if the company already exists
    const websiteUrl = pageData.websiteUrl;
    const exists = await checkCompany(websiteUrl);

    if (exists) {
      return new Response(
        JSON.stringify({ status: false, message: "Company already exists!" }),
        { status: 409 }
      );
    }

    // Insert the company data
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

    // Return success response
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
      JSON.stringify({ status: false, message: "Failed to scrape the website!" }),
      { status: 500 }
    );
  }
};
