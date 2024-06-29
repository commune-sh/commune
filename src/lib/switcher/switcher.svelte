<script lang="ts">
import Logo from '$lib/logo/logo.svelte'
import Items from './items.svelte'
import Settings from './settings.svelte'
import ToggleTheme from '$lib/theme/toggle.svelte'

</script>

<div class="switcher grid grid-rows-[72px_1fr_auto] h-full select-none 
    border-solid border-r border-border">
    <Logo main={true} />
    <Items />
    <div class="grid grid-rows">
        <ToggleTheme />
        <Settings />
    </div>
</div>

<style>
.switcher {
    width: 72px;
}
</style>
