<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'

dayjs.extend(utc);
dayjs.utc()
dayjs.extend(tz)

let {
    event
} = $props();

const ots = $derived(event?.origin_server_ts)

const time = $derived.by(() => {
    return dayjs(ots)?.format('h:mm A')
})
</script>

{time}

<style>
</style>

