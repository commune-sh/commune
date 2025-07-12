<script lang="ts">
import Logo from '../logo/logo.svelte'
import Items from './items.svelte'
import Profile from '../profile/profile.svelte'

import type { Data } from '../types/common'

let {
    data,
}: {
    data: Data,
} = $props();

import { createStore } from '../store/store.svelte'
const store = createStore()

const authenticated = $derived(store.session.authenticated)

</script>

<div class="switcher grid grid-rows-[62px_auto_1fr_auto] h-full select-none 
    border-solid border-r border-switcher-border">
    <Logo is_static={false} loading={false} />
    <div class="sep">
    </div>
    <Items {data} />
    <div class="grid grid-rows">
        {#if authenticated}
            <Profile {data}/>
        {/if}
    </div>
</div>

<style>
.switcher {
    width: 62px;
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
