import { browser  } from '$app/environment'

import type { ValidatedAuthMetadata } from 'matrix-js-sdk/src/oidc/validate'

import { getAuthMetadata, registerOauthClient } from '$lib/matrix/requests'

export let config: {
    metadata: ValidatedAuthMetadata | null;
    client: null
} = $state({
    metadata: null,
    client: null
})

let metadata = $derived(config?.metadata)

let registration_endpoint = $derived(metadata?.registration_endpoint)

if(browser && !config.metadata) {
    fetchAuthMetadata()
}

let checked = $state(false);

$effect.root(() => {
    $effect(() => {
        if(browser && registration_endpoint && !checked) {
            checked = true
            let saved = localStorage.getItem('oidc-client')
            if(saved) {
                console.log("Found saved OIDC client.")
                config.client = JSON.parse(saved)
            } else {
                console.log("No saved OIDC client found. Creating new client.")
                newClient()
            }
        }
    })
})

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
    if(!registration_endpoint) return
    try {
        const response = await registerOauthClient(registration_endpoint)
        console.log(response)
        if(response) {
            config.client = response
            localStorage.setItem('oidc-client', JSON.stringify(response))
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
