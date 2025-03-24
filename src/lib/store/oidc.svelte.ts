import { browser  } from '$app/environment'

import type { ValidatedAuthMetadata } from 'matrix-js-sdk/src/oidc/validate'

import { getAuthMetadata, registerOauthClient } from '$lib/matrix/requests'

import { generateDeviceId, generatePKCEParams } from '$lib/utils/oidc'

export let config: {
    metadata: ValidatedAuthMetadata | null;
    client_id: string | null;
} = $state({
    metadata: null,
    client_id: null
})

let metadata = $derived(config?.metadata)

let registration_endpoint = $derived(metadata?.registration_endpoint)
let authorization_endpoint = $derived(metadata?.authorization_endpoint)

if(browser && !config.metadata) {
    fetchAuthMetadata()
}

let checked = $state(false);

$effect.root(() => {
    $effect(() => {
        if(browser && registration_endpoint && !checked) {
            checked = true
            let saved = localStorage.getItem('oidc_client_id')
            if(saved) {
                console.log("Found saved OIDC client ID.")
                config.client_id = JSON.parse(saved)
            } else {
                console.log("No saved OIDC client found. Creating new client.")
                newClient()
            }
        }
    })
})

async function pkce() {
    generatePKCEParams().then(params => {
        console.log("PKCE", params);
    });
    generateDeviceId().then(device_id => {
        console.log("Device id", device_id);
    });
}

async function fetchAuthMetadata() {
    try {
        const response = await getAuthMetadata()
        console.log(response)
        if(response) {
            config.metadata = response
        }
    } catch (error) {
        console.error(error)
    }
}

async function newClient() {
    if(!registration_endpoint && !authorization_endpoint) return
    try {
        const response = await registerOauthClient(registration_endpoint)
        console.log(response)
        if(response?.client_id) {
            config.client_id = response.client_id
            localStorage.setItem('oidc_client_id', JSON.stringify(response.client_id))
            const res = await fetch('/api/auth/oidc', {
                method: 'POST',
                body: JSON.stringify({
                    client_id: response.client_id,
                    authorization_endpoint: authorization_endpoint
                }),
            });

            const json = await res.json();
            console.log("Cookie store response:", json)
        }
    } catch (error) {
        console.error(error)
    }
}


export function createOIDCStore() {

    return {
        get config() {
            return config;
        },

        get metadata() {
            return metadata;
        },

    }
}
