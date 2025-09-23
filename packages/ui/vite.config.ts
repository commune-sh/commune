import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 5188
    },
	plugins: [tailwindcss(), sveltekit()]
});
