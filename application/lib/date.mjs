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

export const localDateTime = () => {
  return dayjs().tz('Europe/Kiev').format('YYYY-MM-DDTHH:mm:ss')
}

export const isTimeInNightTariff = () => {
  const currentTime = new Date().toLocaleString("en-US", { timeZone: "Europe/Kiev" });
  const date = new Date(currentTime);

  const currentHour = date.getHours();

  // From 23:00 to 7:00
  return currentHour >= 23 || currentHour < 7;
}

export default dayjs;