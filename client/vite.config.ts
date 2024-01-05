import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 8080,
    open: true,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "https://chat-server-4nuldhdlqa-uc.a.run.app",
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
