<script>
import {getPresignedURL, uploadAttachment, UploadWithProgress } from '$lib/utils/request.js'
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { close, video, file } from '$lib/assets/icons.js'

const dispatch = createEventDispatcher();

export let item;
export let roomID;
export let index;

export let isChat = false;

let imageURL;
let videoURL;

let nameInput;
let name;

let ready = false;



$: isImage = item.type.startsWith('image')
$: isVideo = item.type.startsWith('video')
$: isFile = !isImage && !isVideo


onMount(() => {
    if(isImage) {
        const reader = new FileReader();
        reader.onload = () => {
            imageURL = reader.result;
            ready = true
        };
        reader.readAsDataURL(item);
    } else if(isVideo) {
        videoURL = URL.createObjectURL(item);
        ready = true
    } else if(isFile) {
        name = item.name
        if(nameInput) {
            nameInput.placeholder = item.name
        }
        ready = true
    }

    dispatch('attached', true)

    //upload()

    //store.uploadAttachment(item)
})

function updateName() {
    name = nameInput.value
    if(name == '') {
        name = item.name
    }
    store.updateAttachmentName(roomID, index, name)
}

$: percent = $store.attachments[item.id]?.progress || 0

$: uploaded = $store.attachments[item.id]?.key != null

async function upload(thumbnail) {
    const extension = item.name.split('.').pop();
    const presignedURL = await getPresignedURL(extension);

    let file = item
    if(thumbnail) {
        file = item.thumbnail
    }

    await UploadWithProgress(presignedURL.url, file, (progress) => {
        percent = progress
    }, (error, res) => {
        if (error) {
            console.error('Upload failed:', error);
        } else {
            console.log(presignedURL)
            if(thumbnail) {
                store.updateAttachmentThumbnail(roomID, index, presignedURL.key)
            } else {
                store.updateAttachmentURL(roomID, index, presignedURL.key)
            }
            $store.attachments[item.id] = presignedURL.key
            uploaded = true;
            dispatch('uploaded', true)
        }
    })
}

$: if(uploaded && !isChat && isImage) {
    //upload(true)
}

function deleteAttachment() {
    store.deleteAttachment(roomID, index)
    dispatch('deleted', true)
}

</script>


{#if item && ready && isImage}
<div class="item">
    <div class="image" style="background-image: url({imageURL})">
    </div>
    <div class="close grd">
        <div class="grd-c c-ico" on:click={deleteAttachment}>
            {@html close}
        </div>
    </div>
    {#if !uploaded && percent < 100}
        <div class="mk grd">
            <progress id="file" value={percent} max="100"></progress>
        </div>
    {/if}
</div>


{/if}

{#if item && ready && isVideo}
<div class="item">
    <div class="video">
        <video width="170" height="170">
          <source src={videoURL} type={item.type} autoplay muted>
        </video>

    </div>
    <div class="close grd">
        <div class="grd-c c-ico" on:click={deleteAttachment}>
            {@html close}
        </div>
    </div>
    {#if !uploaded && percent < 100}
        <div class="mk grd">
            <progress id="file" value={percent} max="100"></progress>
        </div>
    {/if}
        <div class="vid grd-c c-ico">
            {@html video}
        </div>
</div>
{/if}

{#if item && ready && isFile}
<div class="item">
    <div class="file">
        <div class="grd">
            <div class="icon grd-c mt4">
                {@html file}
            </div>
        </div>
        <div class="filename pa2 mb1">
            <input 
            on:input={updateName}
            bind:this={nameInput}
            bind:value={name} />
        </div>
    </div>
    <div class="close grd">
        <div class="grd-c c-ico" on:click={deleteAttachment}>
            {@html close}
        </div>
    </div>
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
    background: var(--shade-2);
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
.vid {
    fill: white;
    position: absolute;
    left: 0.25rem;
    bottom: 0.25rem;
}
.file {
    display: grid;
    grid-template-rows: 1fr auto;
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
