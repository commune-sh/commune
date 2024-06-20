<script>
import { logo } from '$lib/assets/logo.js';
import { goto } from '$app/navigation';
import { page } from '$app/stores';

let { loading } = $props();

let active = $derived($page.url.pathname == '/')

$effect(() => {
})

function goHome() {
    goto(`/`)
}

</script>

<div class="grid place-items-center">
    <div onclick={goHome}
        class:active={active && !loading}
        class:loading={loading}
        class:animate-pulse={loading}
        class:bg-shade-7={active}
        class="justify-center cursor-pointer w-[46px] h-[46px] p-[8px] bg-logo rounded-[14px] hover:bg-shade-7">
        {@html logo}
    </div>
</div>


<style>
.active {
    background-color: var(--primary);
    --logo-fill: black;
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
