/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { PrimeReactProvider } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Header from "./components/Header";
import { Button } from "primereact/button";
import ErrorBoundary from "./ErrorBoundary";

function App() {
  const [companies,] = useState<any[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<any[]>([]);

  useEffect(() => {}, []);

  const companyTemplate = (rowData: (typeof companies)[0]) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <img
        src={rowData.logo as string}
        alt={rowData.companyName as string}
        style={{ width: "30px", borderRadius: "50%" }}
      />
      <span>{rowData.companyName}</span>
    </div>
  );

  const socialProfilesTemplate = () => (
    <div style={{ display: "flex", gap: "10px" }}>
      <i className="pi pi-facebook" style={{ fontSize: "1.2em" }}></i>
      <i className="pi pi-twitter" style={{ fontSize: "1.2em" }}></i>
      <i className="pi pi-linkedin" style={{ fontSize: "1.2em" }}></i>
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
        <span>{selectedCompanies.length} selected</span>
        <Button label="Delete" />
        <Button label="Export as CSV" />
      </div>
    </div>
  );

  return (
    <React.StrictMode>
      <ErrorBoundary fallback={<h1>Oops! Something went wrong.</h1>}>
        <PrimeReactProvider>
          <Header />
          <div className="datatable-responsive">
            <DataTable
              value={companies}
              paginator
              rows={10}
              header={header}
              selectionMode="checkbox"
              selection={selectedCompanies}
              onSelectionChange={(e) =>
                setSelectedCompanies(e.value as typeof companies)
              }
              dataKey="email"
            >
              <Column
                selectionMode="multiple"
                headerStyle={{ width: "3rem" }}
              ></Column>
              <Column header="Company" body={companyTemplate} />
              <Column header="Social Profiles" body={socialProfilesTemplate} />
              <Column field="description" header="Description" />
              <Column field="address" header="Address" />
              <Column field="phone" header="Phone No." />
              <Column field="email" header="Email" />
            </DataTable>
          </div>
        </PrimeReactProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

export default App;
