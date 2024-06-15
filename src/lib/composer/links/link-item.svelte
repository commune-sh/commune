<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { close } from '$lib/assets/icons.js'

export let item;
export let roomID;
export let index;
export let uploading;

function deleteLink() {
    store.deleteLink(roomID, index)
}

</script>

<div class="link-item ma2 pa2 fl">
    {#if item.image}
        <div class="image mr3 grd-c" 
            style="background-image: url({item.image})">
        </div>
    {/if}
    <div class="ovh fl-co">
        <div class="ti sm">
            {item.title}
        </div>
        <div class="li link mr3 sm">
            {item.href}
        </div>
        {#if item.description}
            <div class="description sm">
                {item.description}
            </div>
        {/if}
        {#if item.author}
            <div class="author sm li">
                By {item.author}
            </div>
        {/if}
    </div>

    {#if !uploading}
    <div class="close grd">
        <div class="grd-c c-ico" on:click={deleteLink}>
            {@html close}
        </div>
    </div>
    {/if}
</div>

<style>
.link-item {
    border: 1px solid var(--border-1);
    position: relative;
    line-height: 1.5;
}
.ovh {
    overflow: hidden;
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
.li {
    color: var(--text-light);
}
.link {
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    height: 22px;
}
.image {
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    border-radius: 3px;
    min-width: 40px;
    min-height: 40px;
    width: 40px;
    height: 40px;
}

.description {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
}
.ti {
    font-weight: 500;
}
</style>
