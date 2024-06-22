<script>
import View from '$lib/view/view.svelte'
import Loading from '$lib/loading/loading.svelte'

import AuthView from '$lib/auth/auth-view.svelte'

let { data } = $props();

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const authReady = $derived(store.auth.ready)
const authenticated = $derived(store.auth.authenticated)

const show_home = $derived(authReady && authenticated)

$effect(() => {
    if(data) {
        console.log(data)
    }
})

</script>


{#if show_home}
    <View />
{:else if !authReady}
    <Loading />
{:else if authReady && !authenticated}
    <AuthView />
{/if}


<style>
</style>
