<script lang="ts">
import Logo from '$lib/logo/logo.svelte'
import Items from './items.svelte'
import User from './user.svelte'

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

const authenticated = $derived(store.session.authenticated)

</script>

<div class="switcher grid grid-rows-[72px_auto_1fr_auto] h-full select-none 
    border-solid border-r border-switcher-border">
    <Logo />
    <div class="sep">
    </div>
    <Items />
    <div class="grid grid-rows">
        {#if authenticated}
            <User />
        {/if}
    </div>
</div>

<style>
.switcher {
    width: 72px;
    height: 100dvh;
}
.sep {
    height: 2px;
    background: var(--border);
    margin-right: 1.2rem;
    margin-left: 1.2rem;
    border-radius: 2px;
}
</style>
