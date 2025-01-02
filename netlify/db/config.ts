export const CONFIG = {
  TABLE: {
    COMPANY_INFORMATION: "company_information",
  },
  VERIFICATION_CODE: Netlify.env.get("VERIFICATION_CODE"),
  MYSQL: {
    HOST: Netlify.env.get("MYSQL_DB_HOST"),
    USER: Netlify.env.get("MYSQL_DB_USER"),
    PASSWORD: Netlify.env.get("MYSQL_DB_PASSWORD"),
    DATABASE_NAME: Netlify.env.get("MYSQL_DB_NAME"),
  },
};
