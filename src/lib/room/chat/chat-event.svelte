<script>
let {
    event,
} = $props();

function logEvent(e) {
    e.preventDefault()
    console.log(event)
}

const m_room_message = $derived(event?.type == 'm.room.message')

const is_thread_message = $derived.by(() => {
    return event?.content['m.relates_to']?.['rel_type'] == 'm.thread'
})

const is_message = $derived.by(() => {
    return m_room_message && !is_thread_message
})

</script>

{#if !is_thread_message}
<div oncontextmenu={logEvent}
    class="chat-event text-sm pb-4 hover:bg-shade-1" >
    {JSON.stringify(event.content)}
</div>
{/if}
