<script>
import '../../app.css'
import { page } from '$app/stores';
let { data, children } = $props()
import { onMount } from 'svelte'
import { goto } from '$app/navigation'
import HomeserverDown from '$lib/alert/homeserver-down.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()


const authenticated = $derived(store.auth.authenticated)

const login_token = $derived($page.url.searchParams.get('loginToken'))

onMount(() => {
    if(!login_token) {
        store.matrix.getFlows()
    }
})

$effect(() => {
    if(authenticated) {
        goto('/')
    }
})

</script>

<HomeserverDown />


<div class="mt-mid flex flex-col h-full items-center">
    <div class="flex flex-col max-w-[460px] w-full px-5">
        {@render children()}
    </div>
</div>

<style>
</style>
