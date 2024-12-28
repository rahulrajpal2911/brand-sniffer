import { Context, HandlerEvent } from "@netlify/functions";
import chromium from "@sparticuz/chromium";
import puppeteer from 'puppeteer-core';
import { checkCompany, insertCompany } from "../../model/company";

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

export default async (request: Request, context: Context) => {
  // Parse query parameters
  const requestKey = request.headers.get('x-verification-code');
  const verificationCode = Netlify.env.get("VERIFICATION_CODE");
  const body = await new Response(request.body).json();
  const url = body!.url;

  // Check verification code
  if (verificationCode !== requestKey) {
    return new Response(JSON.stringify({
      message: "Unauthorized access.",
      status: false,
    }));
  }

  // Validate the URL parameter
  if (
    !url ||
    typeof url !== "string" ||
    !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(url)
  ) {
    return new Response(JSON.stringify({
      message: "Invalid URL parameter.",
      status: false,
    }));
  }

  const chromiumPath = await chromium.executablePath();

  console.log('Puppeteer Path', chromiumPath);

  try {
    // Launch Puppeteer in serverless environment
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: chromiumPath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Scrape data
    const pageData = await page.evaluate(() => {
      const ogSiteName =
        document
          .querySelector('meta[property="og:title"]')
          ?.getAttribute("content") || "";
      const title = document.querySelector("title")?.innerText || "";

      const getAddress = () => {
        const addressElement = Array.from(
          document.querySelectorAll("p") || []
        ).find((p) => p.textContent?.toLowerCase().includes("address"));
        return addressElement?.textContent?.trim() || "";
      };


      const companyLogo =
        document.querySelector('link[rel="icon"]')?.getAttribute("href") ||
        "";
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

      return { companyLogo, companyName, description, address, phoneNumber, emailAddress, websiteUrl, facebookLink, twitterLink, linkedInUrl, youtubeLink, instagramLink };
    });

    await browser.close();

    const websiteUrl = pageData.websiteUrl;

    const exists = await checkCompany(websiteUrl);
    if (exists) {
      return new Response(JSON.stringify({ status: false, message: 'Company name already exist!' }));
    }

    // Usage example
    const id = await insertCompany(pageData.companyLogo, pageData.companyName, pageData.description, pageData.address, pageData.phoneNumber, pageData.emailAddress, pageData.websiteUrl, pageData.facebookLink, pageData.twitterLink, pageData.linkedInUrl, pageData.youtubeLink, pageData.instagramLink);

    // Return the scraped data
    return new Response(JSON.stringify({ status: true, message: 'Company information saved successfully!', id: id }));
  } catch (error) {
    console.error("Error scraping the website:", error);
    return new Response(JSON.stringify({ status: false, message: 'Failed to scrape the website!' }));
  }
};
