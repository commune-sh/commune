<script>
let {
    src,
    w,
    h,
    alt,
    kill
} = $props();

let el;

function close(e) {
    e.preventDefault()
    if(e.target == el) {
        kill()
    }
}

function open() {
    window.open(src, '_blank')
}

</script>

<div class="modal grid" 
    onclick={close}>

        <div class="image-view place-items-center"
            bind:this={el}>
            <img 
                src={src} 
                alt={alt} 
                loading="lazy" />
        </div>

    <div class="tools">
        <button onclick={open} class="px-1">Open in Browser</button>
    </div>

</div>

<style>
.image-view {
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    max-height: 100dvh;
}

.image-view img {
    max-height: calc(100% - 4rem); 
    max-width: calc(100% - 4rem);
    object-fit: contain;
}
.tools {
    position: fixed;
    top: 1rem;
    right: 2rem;
}
button {
    background: none;
    border: none;
    color: var(--light);
}
button:hover {
    color: var(--text);
    text-decoration: underline;
}
</style>
