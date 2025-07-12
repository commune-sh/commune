import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const dev = process.env.NODE_ENV !== 'production';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    csrf: { checkOrigin: !dev },
    files: {
      assets: '../../packages/static'
    }
  },
  preprocess: vitePreprocess()
};

export default config;
