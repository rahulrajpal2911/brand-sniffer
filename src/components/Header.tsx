/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import "primereact/resources/themes/saga-blue/theme.css"; // PrimeReact Theme
import "primereact/resources/primereact.min.css"; // Core CSS
import "primeicons/primeicons.css"; // PrimeIcons
import { useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { fetchWebsiteData } from "../utility/DataExtractor";

const Header = () => {
  const [url, setUrl] = useState<string>();

  const toast = useRef<Toast>(null);

  const show = (
    message: string,
    severity: "info" | "success" | "warn" | "error"
  ) => {
    toast.current!.show({
      severity: severity,
      summary: severity.toUpperCase(),
      detail: message,
    });
  };

  const isValidUrl = (url: string): boolean => {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(url);
  };

  async function createTodo() {
    if (!url) {
      show("URL is not defined.", "warn");
      return;
    }

    if (isValidUrl(url)) {
      try {
        const response = await fetchWebsiteData(url as string);

        console.log("response", response);

        try {
          // await client.models.Company.create(response);
          show("Company information stored successfully!", "success");
        } catch (error: any) {
          show(error.message || "Error storing company information.", "error");
        }
      } catch (error: any) {
        show(error.message || "Error fetching website data.", "error");
      }
    } else {
      show("Please enter a valid URL!", "warn");
    }
  }

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
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter domain name"
              style={{ width: "300px" }}
            />
          </IconField>
        </span>
        <Button
          label="Fetch & Save Details"
          onClick={createTodo}
          className="p-button-primary"
        />
      </div>
    </>
  );
};

export default Header;
