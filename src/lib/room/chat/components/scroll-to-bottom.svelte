<script>
import { down } from '$lib/assets/icons'

let {
    scrollToBottom
} = $props();

</script>

<div class="scroll-to-bottom grid place-items-center cursor-pointer"
    onclick={scrollToBottom}>
    <div class="down h-[24px] w-[24px]">
        {@html down}
    </div>
</div>

<style>
.scroll-to-bottom {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    padding: 0.75rem;
    background: var(--shade-10);
    border-radius: 50%;
    cursor: pointer;
    z-index: 10000;
}
.scroll-to-bottom:hover {
    opacity: 0.8;
}

.down {
    fill: var(--text);
    padding: 0.1rem;
}

.down:hover {
    fill: var(--text);
}

</style>
