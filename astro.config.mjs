// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

const basePath = process.env.PUBLIC_BASE_PATH || "/";

// https://astro.build/config
export default defineConfig({
  output: "static",
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  site: "https://christophschaller.github.io",
  base: basePath,
});
