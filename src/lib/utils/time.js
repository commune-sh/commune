import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(utc);
dayjs.utc()
dayjs.extend(tz)
dayjs.extend(relativeTime)

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
  const date = new Date(ts); 
  const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
  const dayOfMonth = date.getDate();
  
  function getDaySuffix(day) {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
  
  const daySuffix = getDaySuffix(dayOfMonth);
  
  const formattedDate = `${dayOfWeek}, ${month} ${dayOfMonth}${daySuffix}`;
  return formattedDate;
}

