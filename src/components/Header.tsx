/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Toast } from "primereact/toast";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useRef, useState } from "react";

const Header = () => {
  const [url, setUrl] = useState<string>("");
  const toast = useRef<Toast>(null);

  const showToast = (
    message: string,
    severity: "info" | "success" | "warn" | "error"
  ) => {
    if (!toast.current) return;
    toast.current.show({
      severity,
      summary: severity.toUpperCase(),
      detail: message,
    });
  };

  const isValidUrl = (url: string): boolean => {
    return /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:\d+)?(\/[\w-]*)*$/i.test(url);
  };

  const fetchCompanyDetails = async (url: string) => {
    const response = await fetch(
      `/.netlify/functions/scrape?url=${encodeURIComponent(
        url
      )}&verificationCode=${process.env.REACT_APP_VERIFICATION_CODE}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch company details.");
    }
    return response.json();
  };

  const handleFetchAndSave = async () => {
    if (!url) {
      showToast("URL is not defined.", "warn");
      return;
    }

    if (!isValidUrl(url)) {
      showToast("Please enter a valid URL!", "warn");
      return;
    }

    try {
      const result = await fetchCompanyDetails(url);
      console.log("Fetched Data:", result);

      // Simulate storing data
      try {
        // await client.models.Company.create(result);
        showToast("Company information stored successfully!", "success");
      } catch (error: any) {
        showToast(
          error.message || "Error storing company information.",
          "error"
        );
      }
    } catch (error: any) {
      showToast(error.message || "Error fetching website data.", "error");
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem",
        }}
      >
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search"> </InputIcon>
          <InputText
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter domain name"
            style={{ width: "300px" }}
          />
        </IconField>

        <Button
          label="Fetch & Save Details"
          onClick={handleFetchAndSave}
          className="p-button-primary"
        />
      </div>
    </>
  );
};

export default Header;
