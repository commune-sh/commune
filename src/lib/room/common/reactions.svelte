<script>
import Reaction from '$lib/room/common/m.reaction.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    reactions,
} = $props();

function process(reactionEvents) {
  const keyToEventIds = {};

  reactionEvents.forEach(event => {
    const { event_id, content } = event;
    const key = content?.['m.relates_to']?.key;

    if (key) {
      if (!keyToEventIds[key]) {
        keyToEventIds[key] = new Set();
      }
      keyToEventIds[key].add(event_id);
    }
  });

  // Convert sets to arrays for easier usage
  for (const key in keyToEventIds) {
    keyToEventIds[key] = Array.from(keyToEventIds[key]);
  }

  return keyToEventIds;
}

const processed = $derived.by(() => {
  return process(reactions);
});

</script>

<div class="flex flex-cols">
    {#each Object.entries(processed) as [key, events]}
        <Reaction {key} {events} />
    {/each}
</div>
