import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api": {
        // 1.117.52.175
        target: "https://3932-38-207-137-250.ngrok-free.app",
        changeOrigin: true,
      },
    },
  },
});
