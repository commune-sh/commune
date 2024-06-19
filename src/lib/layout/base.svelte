<script>
import Switcher from '$lib/switcher/switcher.svelte'
import Sidebar from '$lib/sidebar/sidebar.svelte'
import View from '$lib/view/view.svelte'
</script>

<div class="grid grid-cols-[72px_232px_1fr] min-h-full">
    <Switcher />
    <Sidebar />
    <View />
</div>

<style>
</style>
