<script>
import { onMount } from 'svelte'

let { 
    num = 20,
    embed = false,
} = $props();

function rp(m) {
    const min = 30;
    const max = m || 60;
    const randomPercentage = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomPercentage;
}

function tp() {
    const min = 1;
    const max = 7;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
let el;
$effect(() => {
    el.scrollTop = el.scrollHeight;
})
</script>

<section class="skeleton-events h-full" class:h={embed}>
    <div class="co overflow-y-auto" bind:this={el}>
    {#each Array(num) as _, i}
        <div class="event p-3">
            <div class="img "></div>
            <div class="ml-3 fl-co">
                <div class="title " style="width:20%"></div>
                {#each Array(tp()) as _, i}
                    <div class="body mt-2" style="width:{rp(80)}%"></div>
                {/each}
                <div class="body mt-2" style="width:{rp()}%"></div>
            </div>
        </div>
    {/each}
    </div>
</section>

<style>
.skeleton-events {
    display: grid;
    grid-template-rows: repeat(auto-fill, auto);
    overflow: hidden;
    position: relative;
}

.h {
    height: 600px;
}

.co {
}

.event {
    display: grid;
    grid-template-columns: auto 1fr;
}

.title {
    background: var(--shade-2);
    border-radius: 500px;
    height: 10px;
}

.body {
    background: var(--shade-2);
    border-radius: 500px;
    height: 10px;
    width: 100%;
}

.img {
    background: var(--shade-2);
    border-radius: 50%;
    height: 30px;
    width: 30px;
}
</style>

