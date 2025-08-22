import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(), // ✅ Add React support
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000, // Client Frontend on port 3000
    proxy: {
      "/api": "http://localhost:5000", // Main Backend
    },
  },
  base: "/", // Changed for Vercel compatibility
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
