<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import AttachmentItem from './attachment-item.svelte'
import ImageItem from './image-item.svelte'
import VideoItem from './video-item.svelte'
import FileItem from './file-item.svelte'

export let roomID;
export let uploading;
export let isChat = false;

$: attachments = $store.editorStates[roomID]?.attachments

</script>

<div class="attachments fl fl-wr">
{#each attachments as attachment, index (attachment)}
    <AttachmentItem
        isChat={isChat}
        item={attachment} 
        roomID={roomID} 
        uploading={uploading} 
        on:attached
        on:deleted
        index={index} />
{/each}
</div>

<style>
.attachments {
    padding-top: 1rem;
    padding-left: 1rem;
}
</style>
