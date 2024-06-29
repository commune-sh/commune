<script>
import { sun, moon } from '$lib/assets/icons'
import { browser } from '$app/environment';
import { getCookie, createCookie } from '$lib/utils/cookie'

import { createStore } from '$lib/store/store.svelte.js'

const store = createStore()

let local = $state(null);

$effect(() => {
})

const theme = $derived(store.app.theme)

const isDark = $derived(theme == 'dark')
const isLight = $derived(theme == 'light')

let toggle = () => {
    store.app.toggleTheme()
}

let el;

</script>

<div class="grid relative place-items-center my-[20px]" >
    <div bind:this={el} class="cursor-pointer stroke w-[1.6rem] h-[1.6rem]" 
        onclick={toggle}>
        {#if isDark}
            {@html sun}
        {:else if isLight}
            {@html moon}
        {/if}
    </div>
</div>

