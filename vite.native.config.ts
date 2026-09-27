import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { localPhotos } from "./scripts/native-photos.ts";

export default defineConfig({
  base: "/web/",
  plugins: [react(), tailwindcss(), {
    name: "bundled-victor-photos",
    transform(code, id) {
      if (!id.includes("/src/")) return;
      if (id.endsWith("index.css")) return { code: localPhotos(code).replace(/^@import url\('https:\/\/fonts\.googleapis[^\n]+\n/m, ""), map: null };
      return { code: localPhotos(code), map: null };
    }
  }],
  build: { outDir: "dist-native", target: "chrome100" },
});
