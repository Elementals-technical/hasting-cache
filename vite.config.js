import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/generate": "http://localhost:8080",
      "/placeholder.svg": "http://localhost:8080",
      "/cache-attributes": "http://localhost:8080",
      "/cache/run": "http://localhost:8080",
    },
  },
});
