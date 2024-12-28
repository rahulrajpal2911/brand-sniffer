/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Toast } from "primereact/toast";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useRef, useState } from "react";
import axios from "axios";
import { isValidUrl, showToast } from "../utils/helper";

const Header: React.FC<{ triggerFetch: () => void }> = ({ triggerFetch }) => {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

  const fetchCompanyDetails = async (url: string) => {
    const verificationCode = import.meta.env.VITE_VERIFICATION_CODE;
    try {
      const response = await axios.post(
        `/.netlify/functions/fetch-site-information`,
        {
          url: url,
        },
        {
          headers: {
            "x-verification-code": verificationCode,
          },
        }
      );
      if (!response.data) {
        return false;
      }
      return response.data;
    } catch (error: any) {
      showToast(
        toast,
        error.message || "Error fetching website data.",
        "error"
      );
      return false;
    }
  };

  const handleFetchAndSave = async () => {
    if (!url) {
      showToast(toast, "URL is not defined.", "warn");
      return;
    }

    if (!isValidUrl(url)) {
      showToast(toast, "Please enter a valid URL!", "warn");
      return;
    }

    try {
      setLoading(true);
      const result = await fetchCompanyDetails(url);
      if (!result.status) {
        showToast(toast, result.message, "error");
      } else {
        setUrl('');
        triggerFetch();
        showToast(toast, result.message, "success");
      }
    } catch (error: any) {
      showToast(
        toast,
        error.message || "Error fetching website data.",
        "error"
      );
    } finally {
      setLoading(false);
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
          background: "#ffffff",
        }}
      >
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search input-fetch-icon"> </InputIcon>
          <InputText
            className="url-input"
            type="url"
            disabled={loading}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter domain name"
          />
        </IconField>

        <Button
          disabled={loading}
          label={loading ? "Fetching..." : "Fetch & Save Details"}
          onClick={handleFetchAndSave}
          className="fetch-btn"
        />
      </div>
    </>
  );
};

export default Header;
