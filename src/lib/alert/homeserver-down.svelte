<script>
import { page } from '$app/state';

import { createStore } from '../store/store.svelte'
const store = createStore()

const down = $derived(store.app.homeserver_reachable == false)

let is_app_group = $derived(page.route.id == '/(app)')

</script>

{#if down}
<div class="alert p-4 bg-red font-semibold grid place-items-center"
    class:pad={is_app_group}>
    <div class="mt-5 py-4 max-w-[430px] w-full 
            border-2 border-primary rounded-[4px]
            text-center">
            Cannot reach homeserver.
    </div>
</div>
{/if}

<style>

.alert {
    position: fixed;
    top: 0rem;
    right: 0;
    left: 0;
}
.pad {
    left: 72px;
}
</style>
