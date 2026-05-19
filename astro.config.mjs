// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// Determine the base path dynamically
const basePath = process.env.PUBLIC_BASE_PATH || "/";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  site: "https://christophschaller.github.io",
  base: basePath,
  output: "static",
});
