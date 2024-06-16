<script>
import { browser  } from '$app/environment'
import { onMount } from 'svelte'

// matrix client store
import { createMatrixClient } from '$lib/store/matrix.svelte.js'
const matrixClient = createMatrixClient()

// auth store
import { createAuthStore } from '$lib/store/auth.svelte.js'
const authStore = createAuthStore()
const authReady = $derived(authStore.ready)

const credentials = $derived($state.snapshot(authStore.credentials))

let ready = $state(false);

$effect(() => {
    if(browser && authReady && credentials && !ready) {
        //matrixClient.setup(credentials)
        ready = true
    }
})

</script>
