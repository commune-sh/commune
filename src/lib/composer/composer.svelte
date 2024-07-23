<script>
import { tick, onMount } from 'svelte'


onMount(() => {
    focus()
})

let textInput;

export async function focus() {
    await tick();
    textInput.focus()
}

</script>

<div>
<input bind:this={textInput} type="text"/>
</div>
