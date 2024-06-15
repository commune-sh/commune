<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { file, close } from '$lib/assets/icons.js'

const dispatch = createEventDispatcher();

export let item;
export let roomID;
export let index;
export let uploading;


function deleteAttachment() {
    store.deleteAttachment(roomID, index)
    dispatch('deleted', true)
}

let nameInput;
let name;

onMount(() => {
    name = item.name
    nameInput.placeholder = item.name

    dispatch('attached', true)
})

function updateName() {
    name = nameInput.value
    if(name == '') {
        name = item.name
    }
    store.updateAttachmentName(roomID, index, name)
}

</script>

{#if item}
<div class="item">
    <div class="file">
        <div class="grd">
            <div class="icon grd-c mt4">
                {@html file}
            </div>
        </div>
        <div class="filename pa2">
            <input 
            on:input={updateName}
            bind:this={nameInput}
            bind:value={name} />
        </div>
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

.file {
    display: grid;
    grid-template-rows: 1fr auto;
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
.filename {
    font-size: 12px;
    font-weight: 500;
    overflow: hidden;
    color: var(--text-light);
    text-overflow: ellipsis;
    white-space: nowrap;
}
.icon {
    height: 60px;
    width: 60px;
    fill: var(--text-light);
}

input {
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-light);
    font-size: 12px;
    font-weight: 500;
    width: 100%;
    outline: none;
    padding: 0.25rem 0.5rem;
    margin: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
input:hover {
    border: 1px solid var(--primary);
}
input:focus {
    border: 1px solid var(--primary);
}
</style>
