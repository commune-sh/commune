<script lang="ts">
import Item from './item.svelte'

let items = $state([
    { id: 0, name: 'Programming' },
    { id: 1, name: 'Music' },
    { id: 2, name: 'Books' },
    { id: 3, name: 'News' },
    { id: 4, name: 'Videos' },
    { id: 5, name: 'Wiki' },
])

function move(id) {
    const index = items.findIndex(item => item.id === id);
    if (index !== -1 && index < items.length - 1) {
        const temp = items[index];
        items[index] = items[index + 1];
        items[index + 1] = temp;
    }
}

// item being dragged over
let moved = $state(null);

// item started to move
function moving(id) {
    moved = id;
}

// kill move state
function end() {
    moved = null;
}

let active = $state(null);

function activate(id) {
    active = id;
}

</script>

<div class="h-100">
    {#each items as item(item.id)}
        <Item {item} {moved} {active}
        move={move} 
        moving={moving} 
        activate={activate} 
        end={end} />
    {/each}

</div>
