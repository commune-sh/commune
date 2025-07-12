<script>
import { download } from "../../../assets/icons";

import { createStore } from '../../../store/store.svelte'
const store = createStore()

let {
    event,
} = $props();

function toggle() {
}

</script>

<div class="download"
    onclick={toggle}>
    <div class="icon h-[20px] w-[20px]">
        {@html download}
    </div>
</div>

<style>
.active {
    background: var(--cmn-1);
}
</style>
