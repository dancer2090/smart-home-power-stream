import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import dayjs from "dayjs"

dayjs.extend(timezone);
dayjs.extend(utc);

export const currentDate = () => {
  return dayjs().format('YYYY.MM.DD')
}
export const currentTime = () => {
  return dayjs().format('HH:mm')
}

export const utcToLocal = (utc) => {
  return dayjs(utc).tz('Europe/Kiev').format('YYYY-MM-DDTHH:mm:ss')
}

export default dayjs;