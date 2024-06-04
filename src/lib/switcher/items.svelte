<script lang="ts">
import Item from './item.svelte'

let items = $state([
    { id: 0, name: "Programming", alias: "programming" },
    { id: 1, name: "photography", alias: "photography" },
    { id: 2, name: "Fitness Fanatic", alias: "fitness" },
    { id: 3, name: "Traveling for Life", alias: "traveling" },
    { id: 8, name: "Cooking", alias: "cooking" },
    { id: 9, name: "Music", alias: "music" },
    { id: 10, name: "News", alias: "news" },
    { id: 11, name: "Gaming Mania", alias: "gaming" },
    { id: 12, name: "Sports Is really cool", alias: "sports" },
    { id: 13, name: "Reading", alias: "reading" },
    { id: 14, name: "Art", alias: "art" },
    { id: 15, name: "DIY Madness", alias: "diy" },
    { id: 16, name: "Movies", alias: "movies" },
    { id: 17, name: "Fashion", alias: "fashion" },
    { id: 18, name: "History Channel", alias: "history" },
    { id: 19, name: "Science", alias: "science" },
    { id: 20, name: "Technology is what i live for and breathe", alias: "technology" },
    { id: 21, name: "Nature", alias: "nature" },
    { id: 22, name: "Pets are really really cool", alias: "pets" },
    { id: 23, name: "Gardening", alias: "gardening" }
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
}

let dragged = $state(null);

function start(index) {
    dragged = index;
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
        <div class="overflow-y-auto h-full hide-scroll pt-[6px]">
        {#each items as space, index (space?.id ?? index)}
            <Item {space} {dragged_over} {dragged} {hovered} {index}
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
