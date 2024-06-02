<script>
import Switcher from '$lib/switcher/switcher.svelte'
import Sidebar from '$lib/sidebar/sidebar.svelte'
import Toggle from '$lib/theme/toggle.svelte'
</script>

<div class="grid grid-cols-[72px_232px_1fr] min-h-screen">
    <Switcher />
    <Sidebar />
  <div class="bg-shade-3">

<div class="flex flex-col mt-20 mx-20">
    <div class="py-10 bg-shade-1">
    </div>
    <div class="py-10 bg-shade-2">
    </div>
    <div class="py-10 bg-shade-3">
    </div>
    <div class="py-10 bg-shade-4">
    </div>
    <div class="py-10 bg-shade-5">
    </div>
    <div class="py-10 bg-shade-6">
    </div>
    <div class="py-10 bg-shade-7">
    </div>
    <div class="py-10 bg-shade-8">
    </div>
    <div class="py-10 bg-shade-9">
    </div>
    <div class="py-10 bg-shade-10">
    </div>
</div>

<Toggle />


    </div>
</div>

<style>
</style>
