import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  // Multi-page app: one entry per HTML page
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        sagradaFamilia: resolve(__dirname, "case-sagrada-familia.html"),
        isocial: resolve(__dirname, "case-isocial.html"),
        christiesPulse: resolve(__dirname, "case-christies-pulse.html"),
      },
    },
    // Output folder (ready to deploy)
    outDir: "dist",
  },
});
