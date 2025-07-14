import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/v0-ns-routing-hg/",
  define: {
    // Make environment variables available at build time
    "process.env.NS_API_KEY": JSON.stringify(process.env.VITE_NS_API_KEY),
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
})
