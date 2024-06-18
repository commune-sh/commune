<script lang="ts">
import Logo from '$lib/logo/logo.svelte'
import Items from './items.svelte'
import Settings from './settings.svelte'
</script>

<div class="grid grid-rows-[72px_1fr_auto] h-screen bg-switcher select-none">
    <Logo />
    <Items />
    <div class="grid grid-rows">
        <Settings />
    </div>
</div>

<style>
</style>
