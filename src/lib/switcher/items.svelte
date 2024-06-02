<script lang="ts">
import Item from './item.svelte'

let items = $state([
    { id: 1, name: 'Music' },
    { id: 2, name: 'Books' },
    { id: 3, name: 'News' },
])

function move(id) {
    const index = items.findIndex(item => item.id === id);
    if (index !== -1 && index < items.length - 1) {
        const temp = items[index];
        items[index] = items[index + 1];
        items[index + 1] = temp;
    }
}

</script>

<div class="h-100">
    {#each items as item}
        <Item move={move} {item} />
    {/each}
</div>
