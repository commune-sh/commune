<script>
import View from '$lib/view/view.svelte'
import Loading from '$lib/loading/loading.svelte'

import AuthView from '$lib/auth/auth-view.svelte'

// auth store
import { createAuthStore } from '$lib/store/auth.svelte.js'
const authStore = createAuthStore()
const authReady = $derived(authStore.ready)
const authenticated = $derived(authStore.authenticated)

const show_home = $derived(authReady && authenticated)

$effect(() => {
})

</script>


    <Loading />


<style>
</style>
