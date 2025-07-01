<script>
import '../app.css'
import { logo } from '$lib/assets/logo';
import { page } from '$app/state';

let message = $derived.by(() => {
    return page?.error?.message || `Something went wrong.`
})

</script>



<div class="flex flex-col h-full justify-center items-center">
    <div class="logo ">
        {@html logo}
    </div>
    <div class="mt-6 font-semibold text-2xl">
        Error
    </div>
    <div class="mt-4">
        {message}
    </div>
</div>


<style>
.logo {
    background-color: var(--logo-background);
    fill: var(--logo-fill);
    border-radius: 14px;
    width: 46px;
    height: 46px;
}
</style>
