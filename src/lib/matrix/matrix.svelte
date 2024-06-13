<script>
import { createMatrixClient } from './matrix.svelte.js'
import { browser  } from '$app/environment'
import { onMount } from 'svelte'
import { login, register } from './requests.js'

let client;

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
        }
    }
})

</script>
