import React, { useState } from 'react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { DatePicker, Tabs } from "antd"
import SunCalc from 'suncalc';
import { useGetHistory } from '../queries/history'
import { cos, sin, convertDegToRadians } from '../helpers/math';
import dayjs, { currentDate, currentTime, utcToLocal } from '../helpers/date';

const prepareChart = (history, options) => {

  return history
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map(item => {

      const { Pmax, Istc, degPannelToGround, degPannelToNorth, n, latitude, longitude } = options;
      const time = utcToLocal(item.created_at);
      const sunPosition = SunCalc.getPosition(
        // new Date(time),
        new Date(item.created_at),
        latitude,
        longitude,
      )

      const cosQ = cos(degPannelToGround);
      const cosFi = sin(degPannelToGround) * cos(sunPosition.altitude, 'radians')
        + cos(degPannelToGround) * sin(sunPosition.altitude, 'radians')
        * cos(
          (sunPosition.azimuth + 2 * Math.PI) - convertDegToRadians(degPannelToNorth)
          ,
          'radians'
        )
        // (sunPosition.azimuth + 2 * Math.PI)
        const Sunx = cos(sunPosition.altitude, 'radians') * sin(sunPosition.azimuth, 'radians')
        const Suny = cos(sunPosition.altitude, 'radians') * cos(sunPosition.azimuth, 'radians')
        const Sunz = sin(sunPosition.altitude, 'radians')
        const Pannelx = sin(degPannelToGround) * sin(degPannelToNorth)
        const Pannely = sin(degPannelToGround) * cos(degPannelToNorth)
        const Pannelz = cos(degPannelToGround)

        const cosFi2 = Math.abs(Sunx * Pannelx) + Math.abs(Suny * Pannely) + Math.abs(Sunz * Pannelz);

      return {
        time,
        ...item,
        // pv_calculated: Math.round(Pmax * (item.solar_radiation * cosQ * cosFi2 / Istc) * n),
        pv_calculated: Math.round(Pmax * (item.solar_radiation * cosQ * (sunPosition.azimuth > 0 ? cosFi2 : 1) / Istc) * n),
        pv_power: item.grid_status ? item.pv_power : 0,
        ...sunPosition,
      }
    })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div>
        {Object.keys(item).map(key => (
          <p>{`${key} : ${item[key]}`}</p>
        ))}
      </div>
    );
  }

  return null;
};

const Charts = () => {
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const from = dayjs(date).startOf('day')
  const to = dayjs(date).add(1, 'day').startOf('day')
  const { result } = useGetHistory(from, to);

  const Pmax = 4920; // W
  const Istc = 1000; // W/m2
  const degPannelToGround = 30 // deg
  const degPannelToNorth = 28 // deg
  const latitude = 50.4902
  const longitude = 30.3759

  const options = {
    latitude,
    longitude,
    Pmax,
    Istc,
    degPannelToGround,
    degPannelToNorth,
    n: 0.95, // loses
  }

  const data = prepareChart(result?.data?.history ?? [], options)

  const onChange = (date, dateString) => {
    setDate(dateString);
  }

  const productionChart = (
    <>
      <p>Pmax - {Pmax}</p>
      <p>lat - {latitude}</p>
      <p>lon - {longitude}</p>
      <p>Pannel angle (ground) - {degPannelToGround} deg</p>
      <p>Sun angle (ground)</p>
      <p>Day - {currentDate()}</p>
      <p>Time - {currentTime()}</p>
      <DatePicker onChange={onChange} defaultValue={dayjs(date, 'YYYY-MM-DD')} />
      <div style={{ width: '100%', height: 600 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="pv_power" stroke="#8884d8" dot={false} activeDot={false} />
            <Line type="monotone" dataKey="pv_calculated" stroke="#82ca9d" dot={false} activeDot={false} />
            <Line type="monotone" dataKey="solar_radiation" stroke="red" dot={false} activeDot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  )

  const suncalc = (
    <>
      <iframe
        title='suncalc'
        width='100%'
        height='700px'
        src={`http://suncalc.net/#/${latitude},${longitude},19/${currentDate()}/${currentTime()}`}
        style={{ border: 'none' }}
      />
    </>
  )

  return (
    <>
      <Tabs
        items={[
          {
            label: `Chart Production`,
            key: 'chart_production',
            children: productionChart,
          },
          {
            label: `Suncalc`,
            key: 'suncalc',
            children: suncalc,
          },
        ]}
      />
    </>
  )
}

export default Charts;
