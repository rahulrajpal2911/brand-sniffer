# Brand Sniffer: Web App with Puppeteer and MySQL Integration

This is a web application that allows users to input a URL, which is then processed by a backend serverless function (Netlify Function) to scrape data using **Puppeteer** and store it in a **MySQL database**. The app is built with **React**, **PrimeReact**, and **TypeScript**, leveraging **Netlify Functions** for backend operations.

---

## Features

1. **Frontend**:
   - Built with **React**, **TypeScript**, and **PrimeReact** for a responsive and user-friendly UI.
   - Accepts a URL input from the user.

2. **Backend**:
   - Serverless backend using **Netlify Functions**.
   - Scrapes website data using **Puppeteer**.
   - Stores scraped data in a MySQL database using **mysql2/promise**.

3. **Database**:
   - **MySQL** database with a `company_information` table for storing scraped company details.

---

## Tech Stack

- **Frontend**: React, PrimeReact, TypeScript
- **Backend**: Node.js, Puppeteer, Netlify Functions
- **Database**: MySQL
- **Build Tool**: Vite
- **Language Version**: TypeScript 5

---

## Environment Variables

Ensure the following environment variables are set in a `.env` file:

```env
VERIFICATION_CODE=your-verification-code
VITE_VERIFICATION_CODE=your-verification-code
MYSQL_DB_HOST=your-mysql-host
MYSQL_DB_PORT=your-mysql-port
MYSQL_DB_NAME=your-database-name
MYSQL_DB_USER=your-database-user
MYSQL_DB_PASSWORD=your-database-password
```

---

## MySQL Table Schema

The application uses the following `company_information` table:

```sql
CREATE TABLE `company_information` (
  `company_id` INT NOT NULL AUTO_INCREMENT,
  `company_logo` VARCHAR(255) NULL,
  `company_name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) NULL,
  `address` VARCHAR(255) NULL,
  `phone_number` VARCHAR(16) NULL,
  `email_address` VARCHAR(80) NULL,
  `website_url` VARCHAR(100) NULL,
  `facebook_link` VARCHAR(100) NULL,
  `twitter_link` VARCHAR(100) NULL,
  `linkedIn_url` VARCHAR(100) NULL,
  `youtube_link` VARCHAR(100) NULL,
  `instagram_link` VARCHAR(100) NULL,
  `status` ENUM('Active', 'In-active') NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`company_id`)
) ENGINE=InnoDB;
```

---

## Guide

1. **User Interaction**:
   - User will enter and paste a URL into the search bar, then click the Fetch button.
   - While fetching, the Fetch button will be disabled, the label will change to "Fetching...", and the input text will also be disabled.

2. **Validation**:
   - The backend will validate the URL. If it is invalid, an error message will be displayed on the button click.
   - If the URL is a duplicate, an error message will also be shown.

3. **Backend Processing**:
   - Upon validation, the backend Netlify Function will call a Puppeteer function to fetch website content.
   - The scraped data will be added to MySQL using a connection pool to reuse connections efficiently.

4. **Error Handling**:
   - If there is a MySQL connection issue, a custom error boundary will display an appropriate error message.

5. **PrimeReact DataTable**:
   - The application uses a PrimeReact DataTable with fixed-size columns matching the Figma design.
   - An Export button allows the user to export data.

6. **Pending Features**:
   - Delete Record
   - Open Company Detail Page

These features are planned for future updates.

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo-name/your-repo.git
cd your-repo
```

---

### 2. Install Dependencies

Install the dependencies for both frontend and backend:

```bash
npm install
```

---

### 3. Configure Environment

Create a `.env` file in the project root and add the environment variables listed above.

---

### 4. Start the Development Server

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`.

---

## Key Notes

1. **Verification Code**:
   - The frontend and backend both use a verification code (`VERIFICATION_CODE` and `VITE_VERIFICATION_CODE`) for secure communication.

2. **Database Connection**:
   - A free MySQL database is used, which may occasionally experience connection issues. If you encounter any errors, please retry after some time.

3. **Error Handling**:
   - An error boundary is implemented in the frontend to handle unexpected errors gracefully.

---

## How It Works

1. **Frontend**:
   - Accepts a URL as input from the user.
   - Sends the URL and verification code to the backend via an API call.

2. **Backend (Netlify Function)**:
   - Validates the URL.
   - Uses Puppeteer to scrape the website for relevant company details.
   - Stores the data in the `company_information` table in MySQL.

3. **Database**:
   - Stores and retrieves company data as required by the frontend.

---

## Folder Structure

```
/src
  /dist                   # Build Files
  /src                    # React components
  /netlify/functions      # Netlify Functions
  /assets                 # Static assets (images, etc.)
.env                      # Environment variables
vite.config.ts            # Vite configuration
```

---

## Dependencies

- **Frontend**:
  - React
  - PrimeReact
  - TypeScript
  - Vite

- **Backend**:
  - Node.js
  - Puppeteer
  - mysql2/promise
  - Netlify Functions

---

## License

This project is licensed under the MIT License.

---

Let me know if there are additional details you'd like to include! 😊
