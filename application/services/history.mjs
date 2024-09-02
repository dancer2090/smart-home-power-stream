import dayjs from "dayjs"
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc)

export const addToHistoryQuery = ({
  pv_power,
  grid_status,
  grid_load,
  load,
  solar_radiation,
}) => {
  const str = `
    INSERT INTO history (pv_power, grid_status, grid_load, home_load, solar_radiation)
    VALUES (${pv_power}, ${grid_status}, ${grid_load}, ${load}, ${solar_radiation})
  `;
  return str;
}

export const getHistoryQuery = ({ from, to }) => {
  const str = `
    SELECT pv_power, grid_status, grid_load, home_load AS load, solar_radiation, created_at FROM history
    WHERE created_at BETWEEN '${from ? from : dayjs().utc().format('YYYY-MM-DD')}' AND '${to ? to : dayjs().add(1, 'day').utc().format('YYYY-MM-DD')}'`
  ;
  return str;
}