import {
    PUBLIC_BASE_URL,
    PUBLIC_HOMESERVER_URL,
} from '$env/static/public';

import { env } from '$env/dynamic/public';
import { redirect } from "@sveltejs/kit";
import { error } from '@sveltejs/kit';

import type { LayoutServerLoad } from './$types';

import { getAuthMetadata, registerOauthClient } from '$lib/matrix/requests'

export const load: LayoutServerLoad = async ({ cookies, url, fetch }) => {

    let read_only = env?.PUBLIC_READ_ONLY === 'true';

    if(read_only) {
        console.log("App is in read-only mode, redirecting to home.")
        redirect(302, '/');
    }

    let oidc_client_id = cookies.get('oidc_client_id');

    let metadata = await fetchAuthMetadata(PUBLIC_HOMESERVER_URL)

    if(!oidc_client_id && metadata?.registration_endpoint && metadata?.authorization_endpoint) {

        let client_id = await newClient(metadata.registration_endpoint, metadata.authorization_endpoint)
        console.log("New client registered:", client_id)

        oidc_client_id = client_id

        cookies.set('oidc_client_id', client_id, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 365,
            secure: true,
            sameSite: 'lax',
            path: '/'
        });

    }

    const access_token = cookies.get('mx_access_token');
    if(access_token) {
        redirect(302, '/');
    }

    return {
        PUBLIC_BASE_URL,
        PUBLIC_HOMESERVER_URL,
        metadata,
        oidc_client_id
    }
};


async function fetchAuthMetadata(homeserver_url: string) {
    try {
        const response = await getAuthMetadata(homeserver_url)
        console.log("OIDC metadata fetched.")
        if(response) {
            return response
        }
    } catch (err: any) {
        error(500, {
            message: "Failed to fetch OIDC metadata"
        });
    }
}

async function newClient(
    registration_endpoint: string, 
    authorization_endpoint: string
) {
    try {
        const response = await registerOauthClient(registration_endpoint, PUBLIC_BASE_URL)
        console.log("Client registered?:", response)
        console.log(registration_endpoint, authorization_endpoint)

        if(response?.client_id) {
            return response.client_id
        }

    } catch (err: any) {
        error(500, {
            message: "Failed to register OIDC client"
        });
    }
}


