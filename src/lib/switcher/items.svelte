<script lang="ts">
import Item from './item.svelte'

let items = $state([
    { id: 0, name: "Programming", alias: "programming" },
    { id: 1, name: "Yacht Rock", alias: "yacht-rock" },
    { id: 2, name: "Fitness Fanatic", alias: "fitness" },
    { id: 3, name: "Traveling for Life", alias: "traveling" },
    { id: 8, name: "Cooking", alias: "cooking" },
    { id: 9, name: "Music", alias: "music" },
    { id: 10, name: "News", alias: "news" },
    { id: 11, name: "Gaming Mania", alias: "gaming" },
    { id: 12, name: "Sports Is really cool", alias: "sports" },
    { id: 13, name: "Reading", alias: "reading" },
])

$effect(() => {
})


function move(from, to) {
    const element = items.splice(from, 1)[0]; 
    items.splice(to, 0, element);
}

// item being dragged over
let dragged_over = $state(null);

// item started to move
function over(index) {
    dragged_over = index;
}

// kill move state
function end() {
    dragged_over = null;
    dragged = null;
    clientY = null;
}

let dragged = $state(null);

function start(index) {
    dragged = index;
}

let hovered = $state(false);

function hover() {
    hovered  = true
}

let clientY = $state(null);

function update(cy) {
    clientY = cy;
}

</script>

<div class="grid grid-rows-[1fr_auto] overflow-hidden">

    <div class="items overflow-hidden"
        onmouseleave={() => hovered = false}
    >
        <div class="overflow-y-auto h-full hide-scroll pt-[6px]">
        {#each items as space, index (space?.id ?? index)}
            <Item {space} {dragged_over} {dragged} {hovered} {index} {clientY}
            move={move} 
            over={over} 
            start={start} 
            hover={hover}
            update={update}
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
