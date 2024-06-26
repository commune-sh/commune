import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { exec } from 'child_process'
import { promisify } from 'util'

// Get current tag/commit and last commit date from git
const pexec = promisify(exec)
let [version, commit] = (
    await Promise.allSettled([
        pexec('git rev-parse --short HEAD'),
        pexec('git rev-parse HEAD'),
    ])
).map(v => JSON.stringify(v.value?.stdout.trim()))

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        fs: {
            allow: ['..'],
        },
    },
    define: {
        __VERSION__: version,
        __COMMIT__: commit,
        __LINK__: `https://github.com/commune-os/client/commit/${commit}`,
    },
});
