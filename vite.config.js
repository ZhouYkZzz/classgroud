import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api": {
        // 1.117.52.175
        target: "https://574d-2409-8a28-4f6-255f-c0e-5da7-9c19-4e8.ngrok-free.app",
        changeOrigin: true,
      },
    },
  },
});
