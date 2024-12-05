import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api": {
        // 1.117.52.175
        target: " https://67a9-205-178-183-233.ngrok-free.app",
        changeOrigin: true,
      },
    },
  },
});
