/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { PrimeReactProvider } from "primereact/api";
import Header from "./components/Header";
import ErrorBoundary from "./ErrorBoundary";
import { ToastProvider } from "./utils/ToastContent";
import Home from "./Home";

function App() {
  const [fetchTrigger, setFetchTrigger] = useState(false);

  const triggerFetchCompanyDetails = () => {
    setFetchTrigger(true); // Trigger fetch in Home
  };

  const handleFetchComplete = () => {
    setFetchTrigger(false); // Reset trigger after fetching is complete
  };

  return (
    <React.StrictMode>
      <ErrorBoundary>
        <PrimeReactProvider>
          <ToastProvider>
            <div style={{ background: "#ECECEC" }}>
              <Header triggerFetch={triggerFetchCompanyDetails} />
              <Home
                triggerFetchCompany={fetchTrigger}
                onFetch={handleFetchComplete}
              />
            </div>
          </ToastProvider>
        </PrimeReactProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

export default App;
