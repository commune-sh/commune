<script>
import { tick, onMount } from 'svelte'

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

const authenticated = $derived(store.session.authenticated)

onMount(() => {
    //focus()
})

let textInput;

export async function focus() {
    await tick();
    if(textInput != null) {
        textInput.focus()
    }
}

</script>

{#if authenticated}
<div>
    <input bind:this={textInput} type="text"/>
</div>
{/if}
