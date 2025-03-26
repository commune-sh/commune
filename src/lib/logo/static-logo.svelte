<script>
import { logo } from '$lib/assets/logo.js';
import { page } from '$app/state';

let active = $derived(page.url.pathname == '/')


</script>

<div class="grid place-items-center">
    <div 
        class="active logo justify-center w-[46px] h-[46px] p-[8px] bg-logo
        rounded-[50%] hover:rounded-[14px] hover:bg-cmn-7">
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
    background: var(--cmn-1);
}

</style>
