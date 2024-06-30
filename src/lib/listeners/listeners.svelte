<script>
import { onMount } from 'svelte'
import { browser } from '$app/environment'

import { createStore } from '$lib/store/store.svelte.js'
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
}

</script>
