<script lang="ts">
import Item from './item.svelte'

let items = $state([
    { id: 0, name: 'Programming', alias: 'programming' },
    { id: 1, name: 'Music', alias: 'music'},
    { id: 2, name: 'Books', alias: 'books'},
    { id: 3, name: 'News', alias: 'news'},
    { id: 4, name: 'Videos', alias: 'videos'},
    { id: 5, name: 'Wiki', alias: 'wiki'},
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
let dragged_over = $state(null);

// item started to move
function over(item) {
    dragged_over = item;
}

// kill move state
function end() {
    dragged_over = null;
}

let dragged = $state(null);

function start(item) {
    dragged = item;
}

</script>

<div class="h-100">
    {#each items as space(space.id)}
        <Item {space} {dragged_over} {dragged}
        move={move} 
        over={over} 
        start={start} 
        end={end} />
    {/each}

</div>
