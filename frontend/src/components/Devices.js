import { Table } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

const { Column } = Table

const columns = [
  {
    title: 'Device Name',
    dataIndex: 'device_name',
    key: 'device_name',
  },
  {
    title: 'Device IP',
    dataIndex: 'device_ip',
    key: 'device_ip',
  },
  {
    title: 'Active Status',
    dataIndex: 'active_status',
    key: 'active_status',
  },
  {
    title: 'Active Power',
    dataIndex: 'active_power',
    key: 'active_power',
  },
  {
    title: 'Max Power',
    dataIndex: 'max_power',
    key: 'max_power',
  },
  {
    title: 'Priority Group',
    dataIndex: 'priority_group',
    key: 'priority_group',
  },
];

const Devices = ({ devices }) => {

  return (
    <Table dataSource={devices} pagination={false}>
      {columns.map(column => {

        if (column.key === 'active_status') {
          return (
            <Column
              title="Active Status"
              dataIndex="active_status"
              key="active_status"
              render={(active_status) => (
                <>
                  {active_status ? <CheckCircleFilled style={{color: 'green', fontSize: 16}} /> : <CloseCircleFilled style={{color: 'red', fontSize: 16}} />} 
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
  );
};

export default Devices