import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/ns-routing/", // Replace with your GitHub repository name
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
})
