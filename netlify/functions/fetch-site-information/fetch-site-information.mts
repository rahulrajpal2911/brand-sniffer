import { Context } from "@netlify/functions";
import chromium from "@sparticuz/chromium";
import puppeteer, { Browser, Page } from "puppeteer-core";
import { checkCompany, insertCompany } from "../../model/company";

// Set Chromium configuration for serverless environments
chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

// Helper function for navigation with retries
const navigateToPage = async (page: Page, url: string, retries = 3): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForSelector("body", { timeout: 60000 }); // Wait for a stable element
      return; // Navigation succeeded
    } catch (error) {
      console.error(`Attempt ${attempt} to navigate to ${url} failed:`, error);
      if (attempt === retries) throw error; // Throw error after max retries
    }
  }
};

// Main Netlify function
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
        JSON.stringify({
          message: "Unauthorized access.",
          status: false,
        }),
        { status: 401 }
      );
    }

    // Validate URL
    if (!url || !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(url)) {
      return new Response(
        JSON.stringify({
          message: "Invalid URL parameter.",
          status: false,
        }),
        { status: 400 }
      );
    }

    // Get Chromium executable path
    const chromiumPath = await chromium.executablePath();
    if (!chromiumPath) {
      throw new Error("Chromium executable path is not found.");
    }

    console.log("Puppeteer Path:", chromiumPath);

    // Launch Puppeteer
    const browser: Browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: chromiumPath,
      headless: chromium.headless,
    });

    const page: Page = await browser.newPage();

    // Navigate to the page with retry logic
    await navigateToPage(page, url);

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

    await browser.close();

    // Check if the company already exists
    const websiteUrl = pageData.websiteUrl;
    const exists = await checkCompany(websiteUrl);

    if (exists) {
      return new Response(
        JSON.stringify({
          status: false,
          message: "Company already exists!",
        }),
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
      JSON.stringify({
        status: false,
        message: "Failed to scrape the website!",
      }),
      { status: 500 }
    );
  }
};
