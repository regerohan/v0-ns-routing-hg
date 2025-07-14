import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/v0-ns-routing-hg/",
  
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
})
