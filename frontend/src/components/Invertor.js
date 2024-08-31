import { Table } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

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
          return (
            <Column
              title={column.title}
              dataIndex={column.dataIndex}
              key={column.key}
              render={(solar_radiation) => (
                <>
                  {solar_radiation} W/m2
                  <br />
                  {Math.round(solar_radiation * 4920 / 1000 * 0.7)} W
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