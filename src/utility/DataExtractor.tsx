import axios from "axios";
import * as cheerio from "cheerio"; // Import cheerio

export const fetchWebsiteData = async (websiteUrl: string) => {
  try {
    const { data: html } = await axios.get(websiteUrl); // Fetch website content
    const $ = cheerio.load(html); // Parse HTML using the latest Cheerio API

    // Target the footer specifically
    const footer = $("footer");

    // Extract data
    const data = {
      logo: footer.find("img.logo").attr("src") || "",
      companyName:
        $('meta[property="og:site_name"]').attr("content") || // Check og:site_name
        $("title").text() || // Fallback to <title>
        "",
      websiteUrl: websiteUrl || "",
      facebookLink: footer.find("a[href*='facebook.com']").attr("href") || "",
      twitterLink: footer.find("a[href*='twitter.com']").attr("href") || "",
      linkedInUrl: footer.find("a[href*='linkedin.com']").attr("href") || "",
      description: $('meta[name="description"]').attr("content") || "",
      address:
        footer.find(".address, p:contains('Address')").text().trim() || "",
      phoneNumber:
        footer.find("a[href^='tel:']").attr("href")?.replace("tel:", "") || "",
      emailAddress:
        footer
          .find("a[href^='mailto:']")
          .attr("href")
          ?.replace("mailto:", "") || "",
    };

    return data;
  } catch (error) {
    console.error("Error fetching website data:", error);
    return {
      logo: "",
      companyName: "",
      websiteUrl: "",
      facebookLink: "",
      twitterLink: "",
      linkedInUrl: "",
      description: "",
      address: "",
      phoneNumber: "",
      emailAddress: "",
    };
  }
};
