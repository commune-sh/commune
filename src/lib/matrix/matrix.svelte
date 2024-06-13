<script>
import { createMatrixClient } from '$lib/matrix/matrix.svelte.js'
import { browser  } from '$app/environment'
import { onMount } from 'svelte'
import { login, register, get_public_rooms, whoami } from './requests.js'

import { matrixStore } from '$lib/matrix/matrix.svelte.js'
const store = matrixStore()
let access_token_validated = $derived(store.access_token_validated)

let client;

$effect(() => {
    if(browser) {
        validateAccessToken()
    }
    if(access_token_validated) {
        console.log('access token validated')
    }
})

async function validateAccessToken() {
    const access_token = localStorage.getItem('access_token')
    if(access_token) {
        const response = await whoami()
        console.log(response)
    }
    store.validateAccessToken()
}

onMount(async() => {
    if(browser) {
        //client = createMatrixClient()
        //client.init()
        // get access_token from localstorage
        const access_token = localStorage.getItem('access_token')
        const user_id = localStorage.getItem('user_id')
        if(access_token && user_id) {
            client = createMatrixClient()
            client.init(access_token, user_id)
        } else {
            const response = await login()
            console.log(response)
            const reg = await register()
            console.log(reg)
            const pub = await get_public_rooms()
            console.log(pub)
        }
    }
})

</script>
{access_token_validated}
test
test
test
test
test
test
test
test
