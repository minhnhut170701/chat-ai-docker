import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 8000,
    open: true,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:3005",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "~": "/src",
    },
  },
});
