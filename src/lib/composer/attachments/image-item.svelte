<script>
import {getPresignedURL, uploadAttachment, UploadWithProgress } from '$lib/utils/request.js'
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { close } from '$lib/assets/icons.js'

const dispatch = createEventDispatcher();

export let item;
export let roomID;
export let index;
export let uploading;

let imageURL;

let ready = false;


let uploaded = false;

onMount(() => {
    const reader = new FileReader();

    reader.onload = () => {
        imageURL = reader.result;
        ready = true
    };

    reader.readAsDataURL(item);
    dispatch('attached', true)

    upload()
})

let percent = 0;

async function upload() {
    const extension = item.name.split('.').pop();
    const presignedURL = await getPresignedURL(extension);
    //await uploadAttachment(item, presignedURL.url);
    await UploadWithProgress(presignedURL.url, item, (progress) => {
        percent = progress
    }, (error, res) => {
        if (error) {
            console.error('Upload failed:', error);
        } else {
            console.log('Upload completed:', res);
            console.log(presignedURL)
            store.updateAttachmentURL(roomID, index, presignedURL.key)
            uploaded = true;
            dispatch('uploaded', true)
        }
    })
}

function deleteAttachment() {
    store.deleteAttachment(roomID, index)
    dispatch('deleted', true)
}

</script>

{#if item && ready}
<div class="item">
    <div class="image" style="background-image: url({imageURL})">
    </div>
    {#if !uploading}
    <div class="close grd">
        <div class="grd-c c-ico" on:click={deleteAttachment}>
            {@html close}
        </div>
    </div>
    {/if}
    {#if uploading}
        <div class="mk grd">
            <div class="loader grd-c">
            </div>
        </div>
    {/if}
    {#if !uploaded && percent < 100}
        <div class="mk grd">
            <progress id="file" value={percent} max="100"></progress>
        </div>
    {/if}
</div>


{/if}

<style>
.mk {
    position: absolute;
    height: 4px;
    left: 0.5rem;
    right: 0.5rem;
    bottom: 0.5rem;
}
.item {
    width: 170px;
    height: 170px;
    margin-right: 1rem;
    margin-bottom: 1rem;
    display: grid;
    grid-template-rows: 1fr auto;
    position:relative;
    border-radius: 14px;
}

.image {
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    border-radius: 14px;
}

.up {
    position: absolute;
    bottom: 6px;
    left: 6px;
}

.close {
    position: absolute;
    top: 6px;
    right: 6px;
    height: 26px;
    width: 26px;
    fill: var(--primary);
    border-radius: 50%;
    background: var(--bg);
}
.c-ico {
    height: 26px;
    width: 26px;
}
</style>
