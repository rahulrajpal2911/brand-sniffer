import { Context } from "@netlify/functions";
import { getAllCompanies } from "../../model/company";

export default async (request: Request, context: Context) => {
  // Parse query parameters
  const requestKey = request.headers.get('x-verification-code');
  const verificationCode = Netlify.env.get("VERIFICATION_CODE");
  const body = await new Response(request.body).json();
  const search = body!.search;

  // Check verification code
  if (verificationCode !== requestKey) {
    return new Response(JSON.stringify({
      message: "Unauthorized access.",
      status: false,
    }));
  }

  try {
    const companies = await getAllCompanies();
    // Return the scraped data
    return new Response(JSON.stringify(companies));
  } catch (error) {
    console.error("Error scraping the website:", error);
    return new Response(JSON.stringify({ status: false, message: 'Failed to scrape the website!' }));
  }
};
