import { conn } from "../db/connection";
import { CONFIG } from "../db/config";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { CompanyInformation } from "../interfaces/company.interface";

const tableName = CONFIG.TABLE.COMPANY_INFORMATION;

// Function to insert a new company
async function insertCompany(
  companyLogo: string,
  companyName: string,
  description: string,
  address: string,
  phoneNumber: string,
  emailAddress: string,
  websiteUrl: string,
  facebookLink: string,
  twitterLink: string,
  linkedInUrl: string,
  youtubeLink: string,
  instagramLink: string
): Promise<number> {
  try {
    const sql = `INSERT INTO ${tableName} (company_logo, company_name, description, address, phone_number, email_address, website_url, facebook_link, twitter_link, linkedIn_url, youtube_link, instagram_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await conn.execute<ResultSetHeader>(sql, [
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
    ]);
    return result.insertId;
  } catch (error) {
    console.error(`Error inserting data into ${tableName}:`, error);
    throw error;
  }
}

// Function to retrieve all companies
async function getAllCompanies(): Promise<CompanyInformation[]> {
  try {
    const sql = `SELECT * FROM ${tableName} ORDER BY company_name ASC`;
    const [rows] = await conn.query<(CompanyInformation & RowDataPacket)[]>(
      sql
    );
    return rows;
  } catch (error) {
    console.error(`Error fetching data from ${tableName}:`, error);
    throw error;
  }
}

// Function to get a company by ID
async function getCompanyById(id: number): Promise<CompanyInformation | null> {
  try {
    const sql = `SELECT * FROM ${tableName} WHERE id = ?`;
    const [rows] = await conn.execute<(CompanyInformation & RowDataPacket)[]>(
      sql,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`Error fetching data from ${tableName} by ID:`, error);
    throw error;
  }
}

async function checkCompany(websiteUrl: string): Promise<boolean> {
  try {
    const sql = `SELECT count(1) as count FROM ${tableName} WHERE LOWER(website_url) = ?`;
    const [record] = await conn.execute<{ count: number } & RowDataPacket[]>(
      sql,
      [websiteUrl.toLowerCase()]
    );
    return record[0].count > 0 ? true : false;
  } catch (error) {
    console.error(`Error fetching data from ${tableName} by ID:`, error);
    throw error;
  }
}

// Export the functions
export { insertCompany, checkCompany, getAllCompanies, getCompanyById };
