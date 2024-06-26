<script>
import '../../app.css'
let { data, children } = $props()
import { goto } from '$app/navigation'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const authenticated = $derived(store.auth.authenticated)

$effect(() => {
    if(authenticated) {
        goto('/')
    }
})

</script>

<div class="mt-mid flex flex-col h-full items-center">
    <div class="flex flex-col max-w-[460px] w-full px-5">
        {@render children()}
    </div>
</div>

<style>
</style>
