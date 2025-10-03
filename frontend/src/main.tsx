import { createRoot } from "react-dom/client";
import "./styles/Global/global.scss";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { StrictMode } from "react";

createRoot(document.getElementById("root")!).render(
  <StrictMode> {/* le wrapper BrowserRouter doit envelopper l'application pour que les composants de react router comme link, route, fonctionnent.*/}
    <App />
  </StrictMode>
);
