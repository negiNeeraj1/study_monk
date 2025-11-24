import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "../src/index.css";
import App from "./App.jsx";

// Development mode debug info
if (import.meta.env.DEV) {
  console.info("🛠️ Running in DEVELOPMENT mode");
  console.info(
    "📡 Admin API URL:",
    import.meta.env.VITE_API_URL || "https://study-monk-admin-backend.onrender.com/api"
  );

  // Unregister any existing service workers in development
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        console.log("🔄 Unregistering service worker in development mode");
        registration.unregister();
      });
    });
  }


}

// Service Worker registration for PWA capabilities (production only)
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
} else {
  console.error("Root element not found");
}
