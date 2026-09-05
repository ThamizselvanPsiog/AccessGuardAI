import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import App from "./App";

import "./index.css";

const savedTheme =
  localStorage.getItem("accessGuardTheme") || "Dark";

const systemIsLight = window.matchMedia(
  "(prefers-color-scheme: light)"
).matches;

const resolvedTheme =
  savedTheme === "System"
    ? systemIsLight
      ? "light"
      : "dark"
    : savedTheme.toLowerCase();

document.documentElement.dataset.theme = resolvedTheme;
document.documentElement.style.colorScheme = resolvedTheme;

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
            <App />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);