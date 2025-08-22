import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Admin Frontend on port 3001
    host: 'localhost',
    strictPort: true,
    proxy: {
      "/api": "http://localhost:5000", // Main Backend
    },
    hmr: {
      host: 'localhost',
      port: 3001,
      protocol: 'ws',
    },
    // Add cache-busting headers for development
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
});
