<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import Item from './link-item.svelte'

export let roomID;
export let uploading;

$: links = $store.editorStates[roomID]?.links
</script>

<div class="links">
{#each links as link, index (link)}
    <Item 
        item={link} 
        roomID={roomID} 
        uploading={uploading} 
        index={index} />
{/each}
</div>

<style>
.links {
    overflow: hidden;
}
</style>
