import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'

dayjs.extend(utc);
dayjs.utc()
dayjs.extend(tz)

export function validAge(date, limit) {
  const createdDate = dayjs(date * 1000);
  const currentDate = dayjs();
  const daysAgo = currentDate.diff(createdDate, 'day');
  return daysAgo >= limit
}

export function dayOfMonth(ts) {
    const date = new Date(ts); 
    const dayOfMonth = date.getDate(); 
    return dayOfMonth;
}

export function formatTS(ts) {
  return dayjs(ts).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
}

