<script>
import { draggable } from '@neodrag/svelte';

let { item, move } = $props();


const initial = $derived(item.name.charAt(0).toUpperCase())

function mo() {
    move(item.id)
}

let options = {
    axis: 'y',
    bounds: 'parent',
  };
</script>

<div class="grid place-items-center mb-[10px]" use:draggable={options}>
    <div class="bg-shade-5 w-[46px] h-[46px] rounded-[50%] grid
        hover:rounded-[14px]
        transition-transform duration-200
        place-items-center cursor-pointer hover:bg-shade-7">
        <div class="font-semibold">
        {initial}
        </div>
    </div>
</div>
