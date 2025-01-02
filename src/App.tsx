import React, { useState } from "react";
import { PrimeReactProvider } from "primereact/api";
import Header from "./components/Header";
import ErrorBoundary from "./ErrorBoundary";
import { ToastProvider } from "./utils/ToastContent";
import Home from "./Home";

function App() {
  const [fetchTrigger, setFetchTrigger] = useState(false);

  const triggerFetchCompanyDetails = () => {
    setFetchTrigger(fetchTrigger ? false : true); // Trigger fetch in Home
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
                onFetchData={handleFetchComplete}
              />
            </div>
          </ToastProvider>
        </PrimeReactProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

export default App;
