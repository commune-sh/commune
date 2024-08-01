<script>
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/base16/atelier-dune.css';

import json from 'highlight.js/lib/languages/json';
hljs.registerLanguage('json', json);

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let active = $derived.by(() => {
    return store.ui.event_source?.active &&
        store.ui.event_source?.event
})

let event = $derived.by(() => {
    return store.ui.event_source?.event
})

let pretty = $derived.by(() => {
    let content = JSON.stringify(event, null, 2)
    let opts = {
        language: 'json',
        ignoreIllegals: true,
    }
    return hljs.highlight(content, opts).value;
})

function kill(e) {
    if(e.target == e.currentTarget) {
        store.ui.killEventSource()
    }
}
</script>

{#if active}
<div class="event-source fixed inset-x-0 inset-y-0 bg-mask grid h-full place-items-center" 
    onclick={kill}>
        <div class="source-container bg-view overflow-hidden">
            <div class="font-semibold px-4 py-2">
                Event Source
            </div>
            <div class="source-body overflow-y-auto p-4 mb-4">
                {@html pretty}
            </div>
        </div>
</div>
{/if}

<style>
.event-source {
    z-index: 10000;
}
.source-container {
    border: 1px solid var(--border);
    width: 600px;
    height: 600px;
    box-shadow: 0px 2px 0px 0px rgba(0,0,0,0.1);
    font-family: monospace;
    font-size: 0.9rem;
    white-space: pre-wrap; 
    line-height: 1.2;
}
.source-body {
    height: 100%;
}
</style>

