import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const dev = process.env.NODE_ENV !== 'production';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    csrf: { checkOrigin: !dev },
    outDir: '../../.svelte-kit',
    files: {
      assets: '../static'
    },
    alias: {
      $ui: '../ui/src/lib',
      $common: '../common'
    }
  },
  preprocess: vitePreprocess()
};

export default config;
