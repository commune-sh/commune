<script lang="ts">
import Item from './item.svelte'

let items = $state([
    { id: 0, name: "Programming", alias: "programming" },
    { id: 1, name: "photography", alias: "photography" },
    { id: 19, name: "Gardening", alias: "gardening" }
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

let hovered = $state(false);

function hover() {
    hovered  = true
}

</script>

<div class="grid grid-rows-[1fr_auto] overflow-hidden">

    <div class="items overflow-hidden"
        onmouseleave={() => hovered = false}
    >
        <div class="overflow-y-auto h-full [&::-webkit-scrollbar]:hidden">
        {#each items as space(space.id)}
            <Item {space} {dragged_over} {dragged} {hovered}
            move={move} 
            over={over} 
            start={start} 
            hover={hover}
            end={end} />
        {/each}
        </div>

    </div>



    <div class="">
        tools
    </div>
</div>

<style>
</style>
