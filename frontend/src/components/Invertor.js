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
];

const Invertor = ({ invertor }) => {
  
  return (
    <Table dataSource={[invertor]} pagination={false}>
      {columns.map(column => {

        if (column.key === 'grid_status') {
          return (
            <Column
              title="Grid Status"
              dataIndex="grid_status"
              key="grid_status"
              render={(grid_status) => (
                <>
                  {grid_status ? <CheckCircleFilled style={{color: 'green', fontSize: 16}} /> : <CloseCircleFilled style={{color: 'red', fontSize: 16}} />} 
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