<script>
import { getSetting, updateSetting } from '$lib/utils/localstorage.js';


let saved_width = $derived.by(() => {
    return getSetting('thread_width');
});

let width = $state(saved_width || 300);

let resizing = $state(false);

let startX = $state(0);

const start = (e) => {
    resizing = true;
    startX = e.clientX;
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', done);
};

const resize = (e) => {
    if(resizing) {
        const deltaX = e.clientX - startX;
        if(deltaX > 0 && width <= 300) return;
        if(deltaX < 0 && width >= 600) return;
        width += -(deltaX)
        startX = e.clientX;
    }
};

const done = () => {
    resizing = false;
    updateSetting('thread_width', width);
    window.removeEventListener('mousemove', resize);
    window.removeEventListener('mouseup', done);
};

$effect(() => {
    if(resizing) {
        document.body.classList.add('resize-cursor');
    } else {
        document.body.classList.remove('resize-cursor');
    }
})


</script>

<div class="thread-container relative grid bg-background">
    <div class="thread grid border-solid border-l border-sidebar-border"
        style="width: {width}px">
        thread
    </div>

    <div class="dragger absolute" 
        class:resizing={resizing}
        onmousedown={start}>
        <div class="holder" >
        </div>
    </div>

</div>

<style>

.dragger {
    width: 11px;
    left: -6px;
    top: 0;
    bottom: 0;
    cursor: col-resize;
    border-radius: 1px;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 10;
}

.resizing {
    opacity: 1;
}

.dragger:hover {
    opacity: 1;
}

.holder {
    height: 100%;
    width: 1px;
    background: var(--dragger);
    margin-left: 5px;
    z-index: 12;
}

@media (max-width: 768px) {
    .thread-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 100;
    }
}
</style>



