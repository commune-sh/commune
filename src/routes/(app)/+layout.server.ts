import { error } from '@sveltejs/kit';
import { initializeAppData } from '$lib/server/app'

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, params, url, cookies } ) => {

    try {
        let data = await initializeAppData(cookies, params, url);
        return data;
    } catch (err: any) {
        console.error("Failed to initialize app data:", err);
        error(500, {
            message: err.body.message,
        });
    }
};

