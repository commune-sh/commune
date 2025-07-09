import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: { 
    adapter: adapter(),
    files: {
      assets: '../static'
    },
    alias: {
      $ui: '../ui/src/lib',
      $common: '../common'
    }
  }
};

export default config;
