<script>
import { 
    processURL,
} from '$lib/utils/matrix'

import { paperclip } from '$lib/assets/icons'

let {
    event,
} = $props();

let audio;

const size = $derived(event?.content?.info?.size)
const mimetype = $derived(event?.content?.info?.mimetype)
const url = $derived(event?.content?.url)
const body = $derived(event?.content?.body)

const src = $derived.by(() => {
    return processURL(url)
})

</script>

<div class="file bg-shade-3 p-2 rounded-[8px] text-xs flex items-center">
    <div class="icon w-[18px] h-[18px] mr-2">
        {@html paperclip}
    </div>
    <div class="truncate">
        {body}
    </div>
</div>


<style>

.file {
    max-width: 350px;
}
</style>
