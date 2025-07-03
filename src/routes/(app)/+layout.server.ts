import {
    PUBLIC_BASE_URL,
    PUBLIC_APPSERVICE_URL,
    PUBLIC_HOMESERVER_URL,
    PUBLIC_HOMESERVER_NAME
} from '$env/static/public';

import type { ENV } from '$lib/types/common'

import { error } from '@sveltejs/kit';
import { initializeAppData } from '$lib/server/app'

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, url, cookies } ) => {

    try {
        let data = await initializeAppData(
            {
                PUBLIC_BASE_URL,
                PUBLIC_APPSERVICE_URL,
                PUBLIC_HOMESERVER_URL,
                PUBLIC_HOMESERVER_NAME,
            } as ENV,
            cookies, 
            params, 
            url
        );
        return data;
    } catch (err: any) {
        console.error("Failed to initialize app data:", err);
        error(500, {
            message: err.body.message,
        });
    }
};

