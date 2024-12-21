// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

// Determine the base path dynamically
const basePath = process.env.GITHUB_BASE_PATH || process.env.PUBLIC_BASE_PATH || '/';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  site: 'https://christophschaller.github.io',
  base: basePath,
  adapter: vercel(),
});
