<script>
import RoomCreated from '$lib/room/chat/events/m.room.create.svelte'

let {
    event,
} = $props();

function logEvent(e) {
    e.preventDefault()
    console.log(event)
}

const m_room_create = $derived(event?.type == 'm.room.create')

const m_room_message = $derived(event?.type == 'm.room.message')

const is_thread_message = $derived.by(() => {
    return event?.content?.['m.relates_to']?.['rel_type'] == 'm.thread'
})

const is_message = $derived.by(() => {
    return m_room_message && !is_thread_message
})

</script>

{#if m_room_create}
    <RoomCreated {event} />
{/if}

{#if !is_thread_message}
<div oncontextmenu={logEvent}
    class="chat-event text-sm pb-4 hover:bg-shade-1 pb-20" >
        {#if event?.content?.body}
        {@html event.content.body}
            {:else}
            {JSON.stringify(event?.content)}
        {/if}
</div>
{/if}
