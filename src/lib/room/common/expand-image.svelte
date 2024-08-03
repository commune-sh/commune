<script>
let {
    src,
    w,
    h,
    alt,
    kill
} = $props();

let img;

function close(e) {
    e.preventDefault()
    if(e.target != img) {
        kill()
    }
}

</script>

<div class="modal grid" 
    onclick={close}>

        <div class="image-view place-items-center">
            <img 
                bind:this={img}
                src={src} 
                alt={alt} 
                loading="lazy" />
        </div>

</div>

<style>
.image-view {
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
}

.image-view img {
    max-height: calc(100% - 4rem); 
    max-width: calc(100% - 4rem);
    object-fit: contain;
}
</style>
