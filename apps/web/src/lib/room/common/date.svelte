<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'

dayjs.extend(utc);
dayjs.utc()
dayjs.extend(tz)
dayjs.extend(advancedFormat)
dayjs.extend(isToday)
dayjs.extend(isYesterday)

let {
    event
} = $props();

const ots = $derived(event?.origin_server_ts)

const today = $derived.by(() => {
    return dayjs(ots).isToday()
})

const yesterday = $derived.by(() => {
    return dayjs(ots).isYesterday()
})

const this_week = $derived.by(() => {
    return dayjs().diff(dayjs(ots), 'day') < 7
})

const date = $derived.by(() => {
    return dayjs(ots)?.format('ddd, MMMM, Do')
})

const time = $derived.by(() => {
    return dayjs(ots)?.format('h:mm A')
})

</script>

{#if today}
    Today at
{:else if yesterday}
    Yesterday at
{:else}
    {date}
{/if}

{time}

<style>
</style>

