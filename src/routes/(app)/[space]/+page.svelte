<script>
import { 
    PUBLIC_META_TITLE,
} from '$env/static/public';

import { get_local_part } from '$lib/utils/matrix'

let {
    data,
} = $props();

$effect(() => {
    if(data) {
        console.log("data is", data)
    }
})

let title = $derived.by(() => {
    let base = `${PUBLIC_META_TITLE}`

    if(data?.space_info?.name) {
        base = `${PUBLIC_META_TITLE} - ${data.space_info.name}`
    } else if(data?.space_info?.canonical_alias) {
        const alias =  get_local_part(data.space_info.canonical_alias)
        base = `${PUBLIC_META_TITLE} - ${alias}`
    }
    return base
})

</script>
<svelte:head>
    <title>{title}</title>
</svelte:head>

