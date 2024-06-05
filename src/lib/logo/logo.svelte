<script>
import { logo } from '$lib/assets/logo.js';
import { goto } from '$app/navigation';
import { page } from '$app/stores';

let active = $derived($page.url.pathname == '/')

$effect(() => {
})

function goHome() {
    goto(`/`)
}

</script>

<div class="grid place-items-center">
    <div onclick={goHome}
        class:bg-shade-7={active}
        class="justify-center cursor-pointer w-[46px] h-[46px] p-[8px] bg-logo rounded-[14px] hover:bg-shade-6">
        {@html logo}
    </div>
</div>


<style>
</style>
