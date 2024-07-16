<script>
import { stack } from '$lib/assets/icons'

let el;
</script>

<div class="grid relative place-items-center my-[20px]" >
    <div bind:this={el} class="cursor-pointer stroke w-[1.6rem] h-[1.6rem]" >
        {@html stack}
    </div>
</div>
