import { Button } from "primereact/button";
import { useState, useEffect, useCallback } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { CompanyInformation } from "./interfaces/CompanyDetail.interface";
import { getCompanyRecords } from "./services/GetCompanyRecords";

const Home: React.FC<{
  triggerFetchCompany: boolean;
  onFetchData: () => void;
}> = ({ triggerFetchCompany, onFetchData }) => {
  const [companies, setCompanies] = useState<CompanyInformation[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<
    CompanyInformation[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCompanyDetails = useCallback(async () => {
    setLoading(true);
    const data = await getCompanyRecords();
    setCompanies(data);
    setLoading(false);
    onFetchData(); // Notify parent fetch is complete
  }, [onFetchData]);

  useEffect(() => {
    if (triggerFetchCompany) {
      fetchCompanyDetails();
    }
  }, [triggerFetchCompany, fetchCompanyDetails]);

  const exportExcel = () => {
    import("xlsx").then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(companies);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
      const excelBuffer = xlsx.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      saveAsExcelFile(excelBuffer, "companies");
    });
  };

  const saveAsExcelFile = (buffer: string, fileName: string) => {
    import("file-saver").then((module) => {
      if (module && module.default) {
        const EXCEL_TYPE =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const EXCEL_EXTENSION = ".xlsx";
        const data = new Blob([buffer], {
          type: EXCEL_TYPE,
        });

        module.default.saveAs(
          data,
          fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION
        );
      }
    });
  };

  const companyTemplate = (rowData: CompanyInformation) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <img
        src={rowData.company_logo as string}
        alt={rowData.company_name as string}
        style={{ width: "30px", borderRadius: "50%" }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://via.placeholder.com/30";
        }}
      />
    </div>
  );

  const socialProfilesTemplate = (rowData: CompanyInformation) => (
    <div style={{ display: "flex", gap: "10px" }}>
      <a
        href={rowData.facebook_link}
        style={{
          color: rowData.facebook_link ? "#6C2BD9" : "#ECECEC",
          cursor: rowData.facebook_link ? "pointer" : "default",
        }}
        target="_blank"
      >
        <i
          style={{ width: "15px", height: "15px" }}
          className="pi pi-facebook"
        ></i>
      </a>
      <a
        href={rowData.twitter_link}
        style={{
          color: rowData.twitter_link ? "#6C2BD9" : "#ECECEC",
          cursor: rowData.twitter_link ? "pointer" : "default",
        }}
        target="_blank"
      >
        <i
          className="pi pi-twitter"
          style={{ width: "15px", height: "15px" }}
        ></i>
      </a>
      <a
        href={rowData.linkedIn_url}
        style={{
          color: rowData.linkedIn_url ? "#6C2BD9" : "#ECECEC",
          cursor: rowData.linkedIn_url ? "pointer" : "default",
        }}
        target="_blank"
      >
        <i
          className="pi pi-linkedin"
          style={{ width: "15px", height: "15px" }}
        ></i>
      </a>
    </div>
  );

  const header = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: "10px" }}>
        <span className="totalCompanies">
          {selectedCompanies.length} selected
        </span>
        <Button
          className="deleteBtn"
          label={`${
            selectedCompanies.length > 0
              ? `Delete ${selectedCompanies.length} Record${
                  selectedCompanies.length > 1 ? "s" : ""
                }`
              : `Delete Record`
          }`}
          style={{
            color: selectedCompanies.length > 0 ? "#6C2BD9" : "#334155",
          }}
        />
        <Button
          className="exportBtn"
          icon="pi pi-file-export"
          label="Export as CSV"
          style={{
            color: selectedCompanies.length > 0 ? "#6C2BD9" : "#334155",
          }}
          onClick={exportExcel}
        />
      </div>
    </div>
  );

  return (
    <div
      className="datatable-responsive"
      style={{ borderRadius: "12px", padding: "6px" }}
    >
      <DataTable
        value={companies}
        loading={loading}
        paginator
        rows={10}
        header={header}
        selectionMode="checkbox"
        selection={selectedCompanies}
        onSelectionChange={(e) =>
          setSelectedCompanies(e.value as CompanyInformation[])
        }
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "46.8px" }}
        ></Column>
        <Column body={companyTemplate} headerStyle={{ width: "33px" }} />
        <Column
          field="company_name"
          header="Company Name"
          headerStyle={{ width: "117px" }}
        />
        <Column
          header="Social Profiles"
          body={socialProfilesTemplate}
          headerStyle={{ width: "135px" }}
        />
        <Column
          field="description"
          header="Description"
          headerStyle={{ width: "555px" }}
        />
        <Column
          field="address"
          header="Address"
          headerStyle={{ width: "219px" }}
        />
        <Column
          field="phone_number"
          header="Phone No."
          headerStyle={{ width: "153px" }}
        />
        <Column
          field="email_address"
          header="Email"
          headerStyle={{ width: "171px" }}
        />
      </DataTable>
    </div>
  );
};

export default Home;
