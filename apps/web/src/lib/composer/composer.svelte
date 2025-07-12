<script lang="ts">
import { tick, onMount } from 'svelte'
import type { Data } from '../types/common'

let {
    data,
}: {
    data: Data
} = $props();

import { createStore } from '../store/store.svelte'
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
