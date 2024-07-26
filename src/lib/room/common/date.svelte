<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'

dayjs.extend(utc);
dayjs.utc()
dayjs.extend(tz)
dayjs.extend(relativeTime)
dayjs.extend(updateLocale)

dayjs.updateLocale('en', {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: 'just now',
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years"
  }
})

let {
    date
} = $props();

const isToday = $derived.by(() => {
    return dayjs().isSame(dayjs(date), 'day')
})

const isThisWeek = $derived.by(() => {
    return dayjs().diff(dayjs(date), 'day') < 7
})

const when = $derived.by(() => {
    return dayjs(date)?.fromNow(true)
})

const created = $derived.by(() => {
    return dayjs(date)?.format('MMM D')
})

const title = $derived.by(() => {
    return dayjs(date)?.format()
})


</script>

<div class="date text-sm" title={title}>
    {isThisWeek ? when : created}
</div>

<style>
</style>

