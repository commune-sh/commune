<script lang="ts">
import Item from './item.svelte'

let items = $state([
    { id: 0, name: "Programming", alias: "programming" },
    { id: 1, name: "Photography", alias: "photography" },
    { id: 2, name: "Fitness", alias: "fitness" },
    { id: 3, name: "Traveling", alias: "traveling" },
    { id: 4, name: "Cooking", alias: "cooking" },
    { id: 5, name: "Music", alias: "music" },
    { id: 6, name: "News", alias: "news" },
    { id: 7, name: "Gaming", alias: "gaming" },
    { id: 8, name: "Sports", alias: "sports" },
    { id: 9, name: "Reading", alias: "reading" },
    { id: 10, name: "Art", alias: "art" },
    { id: 11, name: "DIY", alias: "diy" },
    { id: 12, name: "Movies", alias: "movies" },
    { id: 13, name: "Fashion", alias: "fashion" },
    { id: 14, name: "History", alias: "history" },
    { id: 15, name: "Science", alias: "science" },
    { id: 16, name: "Technology", alias: "technology" },
    { id: 17, name: "Nature", alias: "nature" },
    { id: 18, name: "Pets", alias: "pets" },
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
</script>

<div class="grid grid-rows-[1fr_auto] overflow-hidden">

    <div class="items overflow-hidden" 
        onmouseenter={() => hovered = true}
        onmouseleave={() => hovered = false}
    >
        <div class="overflow-y-auto h-full [&::-webkit-scrollbar]:hidden">
        {#each items as space(space.id)}
            <Item {space} {dragged_over} {dragged} {hovered}
            move={move} 
            over={over} 
            start={start} 
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
