<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { close, video } from '$lib/assets/icons.js'

const dispatch = createEventDispatcher();

export let item;
export let roomID;
export let index;
export let uploading;

let videoURL;

let ready = false;

onMount(() => {
    videoURL = URL.createObjectURL(item);
    ready = true
    dispatch('attached', true)
})

function deleteAttachment() {
    store.deleteAttachment(roomID, index)
    dispatch('deleted', true)
}

</script>

{#if item && ready}
<div class="item">
    <div class="video">
        <video width="170" height="170">
          <source src={videoURL} type={item.type} autoplay muted>
        </video>

    </div>
    {#if !uploading}
    <div class="close grd">
        <div class="grd-c c-ico" on:click={deleteAttachment}>
            {@html close}
        </div>
    </div>
    {/if}
    {#if uploading}
        <div class="mask grd">
            <div class="loader grd-c">
            </div>
        </div>
    {/if}
        <div class="vid grd-c c-ico">
            {@html video}
        </div>
</div>


{/if}

<style>
.mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--mask);
    border-radius: 14px;
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
    background: var(--shade-2);
}

.image {
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    border-radius: 14px;
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
.vid {
    fill: white;
    position: absolute;
    left: 0.25rem;
    bottom: 0.25rem;
}
</style>
