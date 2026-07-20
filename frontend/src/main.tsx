import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { WalletContextProvider } from "./context/WalletContextProvider";
import { AppDataProvider } from "./context/AppDataContext";
import { Buffer } from "buffer";
globalThis.Buffer= Buffer;
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <WalletContextProvider>
        <AppDataProvider>
          <App />
        </AppDataProvider>
      </WalletContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);