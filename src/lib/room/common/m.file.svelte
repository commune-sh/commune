<script>
import { 
    processURL,
} from '$lib/utils/matrix'

import { 
    formatBytes,
} from '$lib/utils/utils'

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

const formatSize = $derived.by(() => {
    if(size) {
        return formatBytes(size)
    }
})

const title = $derived.by(() => {
    return `${body} (${formatSize})`
})
</script>

<div class="file bg-cmn-3 p-2 rounded-[8px] text-xs 
    grid grid-cols-[auto_1fr_auto] items-center" title={title}>
    <div class="icon w-[18px] h-[18px] mr-2">
        {@html paperclip}
    </div>
    <div class="truncate">
        <a href={src} target="_blank" rel="noreferrer" download={body}>
            {title}
        </a>
    </div>
    <div class="text-light">
        ({formatSize})
    </div>
</div>


<style>

.file {
    max-width: 350px;
}

a:link {
    color: var(--text);
    cursor: pointer;
}
a:hover {
    text-decoration: underline;
}
</style>
