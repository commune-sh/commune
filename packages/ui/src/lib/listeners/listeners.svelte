<script>
import { onMount } from 'svelte'
import { browser } from '$app/environment'

import { createStore } from '../store/store.svelte'
const store = createStore()

const theme = $derived(store.app.theme)

onMount(() => {
    if (browser) {
        setupThemeListener()
    }
})

function setupThemeListener() {
    window.addEventListener("storage", (e) => {
        if (e.key == "theme") {
            let newTheme = e.newValue
            if(theme != newTheme) {
                store.app.toggleTheme()
            }
        }
    })
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    })


    document.body.addEventListener('click', function(event) {
        const target = event.target;
        if (target.tagName.toLowerCase() === 'a' && target.hasAttribute('data-type')) {
            const type = target.getAttribute('data-type');
            const identifier = target.getAttribute('data-id');

            if (type === 'user') {
                console.log(`User clicked: ${identifier}`);
            } else if (type === 'room') {
                console.log(`Room clicked: ${identifier}`);
            }
        }
    });

    document.addEventListener('mouseover', function(event) {
        const target = event.target;
        const codeblock = target.tagName === 'CODE' && 
            target.parentNode.tagName === 'PRE';

        if (codeblock) {
        }
    });

}

</script>
