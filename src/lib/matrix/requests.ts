import { PUBLIC_HOMESERVER, PUBLIC_APP_NAME, PUBLIC_HOMESERVER_BASE_URL } from '$env/static/public';
import { fetchWithTimeout, fetchWithRetry } from '$lib/utils/fetch';

import type { ValidatedAuthMetadata } from 'matrix-js-sdk/src/oidc/validate'

export const MATRIX_BASE_URL = `${PUBLIC_HOMESERVER}/_matrix/client/v3`

export const wellKnownClient = async () => {
    const url = `${PUBLIC_HOMESERVER_BASE_URL}/.well-known/matrix/client`;
    let options = {
        headers: {
            'Content-Type': 'application/json',
        },
    }
    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }
}


export const login = async (body) => {
    const url = `${MATRIX_BASE_URL}/login`;

    let options = {
        headers: {
            'Content-Type': 'application/json',
        },
    }

    if(body !== undefined && body?.type != ''){
        options.method = 'POST'
        options.body = JSON.stringify(body)
    }

    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }

}

export const register = async (body) => {
    const url = `${MATRIX_BASE_URL}/register`;

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "initial_device_display_name": PUBLIC_APP_NAME,
        })
    }

    if(body !== undefined && body?.type != ''){
        options.body = JSON.stringify(body)
    }


    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }
}

export const requestToken = async (opts) => {
    if(!opts.email || !opts.client_secret || !opts.send_attempt){
        throw new Error('Missing required parameters')
    }
    const url = `${MATRIX_BASE_URL}/register/email/requestToken`;

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "client_secret": opts.client_secret,
            "email": opts.email,
            "send_attempt": opts.send_attempt,
        })
    }

    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }

}


export const requestPasswordToken = async (opts) => {
    if(!opts.email || !opts.client_secret || !opts.send_attempt){
        throw new Error('Missing required parameters')
    }
    const url = `${MATRIX_BASE_URL}/account/password/email/requestToken`;

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "client_secret": opts.client_secret,
            "email": opts.email,
            "send_attempt": opts.send_attempt,
        })
    }

    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }

}

export const savePassword = async (opts) => {
    if(!opts.new_password || !opts.client_secret || !opts.auth){
        throw new Error('Missing required parameters')
    }
    const url = `${MATRIX_BASE_URL}/account/password`;

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(opts)
    }

    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }

}


export const usernameAvailable = async (username) => {
    const url = `${MATRIX_BASE_URL}/register/available?username=${username}`;

    let options = {
        headers: {
            'Content-Type': 'application/json',
        },
    }

    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }

}


export const get_public_rooms = async () => {
    const url = `${MATRIX_BASE_URL}/publicRooms`;

    let options = {
        headers: {
            'Content-Type': 'application/json',
        },
    }

    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }

}

export const whoami = async (access_token) => {
    const url = `${MATRIX_BASE_URL}/account/whoami`;

    let options = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
        },
    }

    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }

}

export const getVersions = async () => {
    const url = `${PUBLIC_HOMESERVER}/_matrix/client/versions`;

    let options = {
        headers: {
            'Content-Type': 'application/json',
        },
    }

    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }

}

export const openidConfig = async (issuer) => {
    const url = `${issuer}.well-known/openid-configuration`;
    let options = {
        headers: {
            'Content-Type': 'application/json',
        },
    }
    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }
}

export const getAuthMetadata = async (): Promise<ValidatedAuthMetadata | undefined> => {

    const url = `${PUBLIC_HOMESERVER_BASE_URL}/_matrix/client/unstable/org.matrix.msc2965/auth_metadata`;

    const options: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
    }

    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }
}


export const exchangeForToken = async (url: string, params: any) => {

    const options: RequestInit = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        body: params
    }

    try {
        const response = await fetch(url, options)
        return response.json();
    } catch (error) {
        throw error
    }
}


export async function syncGuest(accessToken) {
    try {
        const filter = {
            room: {
                timeline: { limit: 10 },
                state: { limit: 10 },
                ephemeral: { not_types: ['m.receipt'] },
                account_data: { not_types: ['*'] }
            },
            presence: { not_types: ['*'] },
            account_data: { not_types: ['*'] }
        };

        const response = await fetch(`${PUBLIC_HOMESERVER}/_matrix/client/r0/sync?timeout=30000&filter=${encodeURIComponent(JSON.stringify(filter))}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error during sync: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle new events
        if (data.rooms && data.rooms.join) {
            Object.keys(data.rooms.join).forEach(roomId => {
                const room = data.rooms.join[roomId];
                room.timeline.events.forEach(event => {
                    console.log(`New event in room ${roomId}:`, event);
                });
            });
        }

        // Continue polling
        setTimeout(() => syncGuest(accessToken), 3000);
    } catch (error) {
        console.error('Error during manual sync:', error);
        // Retry after a delay in case of error
        setTimeout(() => syncGuest(accessToken), 5000);
    }
}

