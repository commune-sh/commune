<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
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
    event,
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

const this_year = $derived.by(() => {
    return dayjs(ots).year() == dayjs().year()
})

const format = $derived.by(() => {
    if(!this_year) return `MMMM Do, YYYY`
    return this_week ? `dddd, MMMM Do` : `MMMM Do`
})

const created = $derived.by(() => {
    return dayjs(ots)?.format(format)
})

const date = $derived.by(() => {
    if(today) return `Today`
    if(yesterday) return `Yesterday`
    return created
})

</script>

<div class="new-day">
    <div class="date text-xs font-medium text-light">
        {date}
    </div>
</div>

<style>
.new-day {
    border-top: 1px solid var(--shade-5);
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    margin-left: 1.5rem;
    margin-right: 1.5rem;
    display: flex;
    justify-content: center; 
    align-items: center;
    user-select: none;
}
.date {
    margin-top: -0.5rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    background: var(--view);
}
@media (max-width: 768px) {
    .new-day {
        margin-left: 0.5rem;
        margin-right: 0.5rem;
    }
}
</style>
