import { Table } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import SunCalc from 'suncalc';

const Pmax = 4920; // W
const Istc = 1000; // W/m2
const toRadians = (deg) => deg * Math.PI / 180
const degPannelToGround = 30

const PannelAngle = toRadians(degPannelToGround) // 30 deg
const latitude = 50.490445
const longitude = 30.375822

const { Column } = Table

const columns = [
  {
    title: 'Inverter IP',
    dataIndex: 'ip',
    key: 'ip',
  },
  {
    title: 'PV Power',
    dataIndex: 'pv_power',
    key: 'pv_power',
  },
  {
    title: 'PV Potential',
    dataIndex: 'pv_potential',
    key: 'pv_potential',
  },
  {
    title: 'Load',
    dataIndex: 'load',
    key: 'load',
  },
  {
    title: 'Grid Load',
    dataIndex: 'grid_load',
    key: 'grid_load',
  },
  {
    title: 'Grid Status',
    dataIndex: 'grid_status',
    key: 'grid_status',
  },
  {
    title: 'Solar Radiation',
    dataIndex: 'solar_radiation',
    key: 'solar_radiation',
  },
];

const Invertor = ({ invertor }) => {
  
  return (
    <Table dataSource={[invertor]} pagination={false}>
      {columns.map(column => {

        if (column.key === 'grid_status') {
          return (
            <Column
              title={column.title}
              dataIndex={column.dataIndex}
              key={column.key}
              render={(grid_status) => (
                <>
                  {grid_status ? <CheckCircleFilled style={{color: 'green', fontSize: 16}} /> : <CloseCircleFilled style={{color: 'red', fontSize: 16}} />} 
                </>
              )}
            />
          )
        }

        if (column.key === 'solar_radiation') {
          const sunPosition = SunCalc.getPosition(new Date(), latitude, longitude)
          const cosQ = Math.cos(PannelAngle);
          const cosFi = 
            Math.sin(toRadians(degPannelToGround)) * Math.cos(sunPosition.altitude)
            + Math.cos(toRadians(degPannelToGround)) * Math.sin(sunPosition.altitude) *  Math.cos(sunPosition.azimuth - toRadians(28))

          return (
            <Column
              title={column.title}
              dataIndex={column.dataIndex}
              key={column.key}
              render={(solar_radiation) => (
                <>
                  {solar_radiation} W/m2
                  <br />
                  {Math.round(Pmax * (solar_radiation * cosQ * cosFi / Istc) * 0.9)} W
                </>
              )}
            />
          )
        }
        return (
          <Column
            title={column.title}
            dataIndex={column.dataIndex}
            key={column.key}
          />
        )
      })}
    </Table>
  )
};

export default Invertor