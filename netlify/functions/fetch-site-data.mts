import { Handler } from "@netlify/functions";
import puppeteer from "puppeteer-core"; // Use puppeteer-core for serverless environments
import chromium from "chrome-aws-lambda"; // Puppeteer support for AWS Lambda

export const handler: Handler = async (event, context) => {
  // Parse query parameters
  const params = new URLSearchParams(
    (event.queryStringParameters as any) || {}
  );
  const url = params.get("url");
  const verificationCode = params.get("verificationCode");

  // Check verification code
  if (verificationCode !== process.env.VERIFICATION_CODE) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Unauthorized access." }),
    };
  }

  // Validate the URL parameter
  if (
    !url ||
    typeof url !== "string" ||
    !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(url)
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid URL parameter." }),
    };
  }

  try {
    // Launch Puppeteer in serverless environment
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Scrape data
    const footerData = await page.evaluate(() => {
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

      return {
        logo:
          document.querySelector('link[rel="icon"]')?.getAttribute("href") ||
          "",
        companyName: ogSiteName || title || "",
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
      };
    });

    await browser.close();

    // Return the scraped data
    return {
      statusCode: 200,
      body: JSON.stringify(footerData),
    };
  } catch (error) {
    console.error("Error scraping the website:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to scrape the website." }),
    };
  }
};
