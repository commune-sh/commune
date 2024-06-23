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
        Direct Messages
    </div>
</div>

<div class="grid place-items-center">
    <div onclick={goHome}
        bind:this={el}
        class:active={active && !loading}
        class:loading={loading}
        class:animate-pulse={loading}
        class:bg-shade-7={active}
        class="logo justify-center cursor-pointer w-[46px] h-[46px] p-[8px] bg-logo
        rounded-[50%] hover:rounded-[14px] hover:bg-shade-7">
        {@html logo}
    </div>
</div>


<style>

.active {
    background-color: var(--primary);
    --logo-fill: black;
    border-radius: 14px;
}

.logo:hover {
    background-color: var(--primary);
    --logo-fill: black;
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
