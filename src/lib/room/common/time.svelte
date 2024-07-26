<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'

dayjs.extend(utc);
dayjs.utc()
dayjs.extend(tz)


let {
    date
} = $props();

const created = $derived.by(() => {
    return dayjs(date)?.format('h:mm A')
})

const title = $derived.by(() => {
    return dayjs(date)?.format()
})


</script>

{created}

<style>
</style>

