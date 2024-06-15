<script>
export let shortcode;
import { store } from '$lib/store/store.js'
import {onMount, onDestroy, createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher()

export let target;
export let reply;
export let hide = false;

export let isChat = false;
export let room_alias = null;

$: space_emoji = $store.space_emoji?.find(x => x.alias == room_alias)?.emoji
$: matchedCustom = space_emoji?.filter(x => x.name.toLowerCase().includes(shortcode))

$: bounds = target.getBoundingClientRect()
$: top = bounds.top + bounds.height

$: offset = isChat ? 60 : 180

$: bottom = bounds.height + offset

$: matchedEmojis = window?.emoji?.filter(x => x.shortcode.includes(shortcode))

$: matched = items[0]

$: items = matchedCustom ? [...matchedCustom, ...matchedEmojis] : matchedEmojis

$: if(matched) {
    if(matched.url && matched.name) {
        dispatch('matched', matched)
    } else {
        dispatch('matched', matched.unicode)
    }
}

$: if(items.length == 0) {
    window.removeEventListener('keydown', handleKeydown)
}


onMount(() => {
    dispatch('matched', matched?.unicode)
    if(matched != undefined) {
        window.addEventListener('keydown', handleKeydown)
    }
})

onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown)
})


function handleKeydown(e) {

    if(e.key == 'ArrowDown' || e.key == 'Tab' && !e.shiftKey) {
        e.preventDefault()
        const currentIndex = items.indexOf(matched);
        const nextIndex = (currentIndex + 1) % items.length;
        matched = items[nextIndex];
    }

    if(e.key == 'ArrowUp' || (e.key == 'Tab' && e.shiftKey)) {
        e.preventDefault()
        const currentIndex = items.indexOf(matched);
        const previousIndex = (currentIndex - 1 + items.length) % items.length;
        matched = items[previousIndex];
    }

    if(e.key == 'Enter') {
        if(matched) {
            e.preventDefault()

            if(matched.url && matched.name) {
                dispatch('selected', matched)
            } else {
                dispatch('selected', matched.unicode)
            }

            items = []
            matched = undefined
        }
    }
}

function select(item) {
    if(item.url && item.name) {
        dispatch('selected', item)
    } else {
        dispatch('selected', item.unicode)
    }
    items = []
    matched = undefined
}


let root;


function highlight(item) {
    console.log(matched.shortcode)
    if(matched.shortcode == item.shortcode) {
        return true
    }
    return false
}


</script>

{#if items.length > 0}
<div class="emoji-list" tabindex="0"
    bind:this={root}
    class:hide={hide}
    class:t={!reply}
    class:b={reply}
    style="--top:{top}px;--bottom:{bottom}px;">

    <div class="header">
            <span class="h">MATCHING</span>
            <span class="s ml1">:{shortcode}</span>
    </div>

    <div class="list fl fl-co">


        {#each items as item}
            <div class="emoji-item fl pa2" 
                on:click={select(item)}
                    class:high={(item.shortcode && (matched.shortcode ==
                    item.shortcode)) || !item.shortcode && (item.url ==
                            matched.url)}>

                <div class="emoji-key">
                    {#if item?.url}
                        <img src={item.url} height="16" width="16" />
                    {:else}
                        {@html item.unicode}
                    {/if}
                </div>

                <div class="emoji-shortcode ml3">
                    {#if item?.name}
                        :{item.name}:
                    {:else}
                        {item.shortcode}
                    {/if}
                </div>
            </div>
        {/each}

    </div>

</div>
{/if}

<style>
.emoji-list {
    position: absolute;
    left: 0;
    right: 0;
    background-color: var(--emoji-list);
    margin-right: 2rem;
    margin-left: 2rem;
    margin-bottom: -4rem;
    display: grid;
    grid-template-rows: auto 1fr;
    border-radius: 8px;
    box-shadow: 0px 1px 20px -5px rgba(0,0,0,0.1);
    z-index: 9999;
    max-height: 400px;
    overflow: hidden;
}

.hide {
    visibility: hidden;
}

.t {
    top: var(--top);
}

.b {
    bottom: var(--bottom);
}

.high {
    background-color: var(--shade-4);
}
.header {
    padding: 1rem 0.5rem;
}
.h {
    color: var(--text-light);
    font-weight: 500;
    font-size: small;
}
.s {
    font-weight: 500;
    font-size: small;
}
.list {
    overflow-y: auto;
}
.emoji-item{
    cursor: pointer;
}
.emoji-item:hover {
    background-color: var(--shade-4);
}
</style>
