import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./Components/AuthProvider";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
    <BrowserRouter basename="/Binsoo-Shop/">
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
);
