<script>
import { logo } from '$lib/assets/logo.js';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { onMount } from 'svelte';
import tippy from 'tippy.js';

let { is_static, loading } = $props();

let active = $derived($page.url.pathname == '/')

$effect(() => {
})

function goHome() {
    if(is_static) {
        return
    }
    goto(`/`)
}

let tooltip;
let el;
let content;

onMount(() => {
    if(is_static) {
        return
    }
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

<div class="container grid place-items-center">
    <div onclick={goHome}
        bind:this={el}
        class:active={(active && !loading) || is_static}
        class:loading={loading}
        class:animate-pulse={loading}
        class:cursor-pointer={!is_static}
        class="logo relative bg-shade-7 justify-center w-[46px] h-[46px] p-[4px]
        rounded-[50%] hover:rounded-[14px] hover:bg-shade-7">
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
