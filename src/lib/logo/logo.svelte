<script>
import { logo } from '$lib/assets/logo.js';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { onMount } from 'svelte';
import tippy from 'tippy.js';

let { main, loading } = $props();

let active = $derived($page.url.pathname == '/')

$effect(() => {
})

function goHome() {
    goto(`/`)
}

let tooltip;
let el;
let content;

onMount(() => {
    tooltip = tippy(el, {
        content: content,
        placement: 'right',
        arrow: true,
        duration: 1,
        offset: [0, 26],
        theme: 'inline',
    });
    content.style.display = 'block'
})

</script>

<div class="hidden" bind:this={content}>
    <div class="font-bold">
        Home
    </div>
</div>

<div class="grid place-items-center">
    <div onclick={goHome}
        bind:this={el}
        class:active={active && !loading}
        class:loading={loading}
        class:animate-pulse={loading}
        class="logo bg-shade-7 justify-center cursor-pointer w-[46px] h-[46px] p-[4px] rounded-[50%] hover:bg-shade-7">
        {@html logo}
    </div>
</div>


<style>

.logo {
    fill: var(--logo-fill-inactive);
}

.logo:hover {
    background-color: var(--logo-background);
    fill: var(--logo-fill);
}

.active {
    background-color: var(--logo-background);
    fill: var(--logo-fill);
    border-radius: 14px;
}


.loading {
    height: 38px;
    width: 38px;
    padding: 8px;
    border-radius: 12px;
    cursor: default;
    background: var(--shade-1);
}

</style>
