import { useCallback, useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Select } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { useEditDevice } from '../queries/listDevices'

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
  const { result, execute } = useEditDevice()

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDevice, setEditDevice] = useState(null);
  const [form] = Form.useForm();

  const showModal = (id) => {
    setIsModalOpen(true);
    setEditDevice(devices.find(device => device.id === id))
  };

  useEffect(() => {
    if (!editDevice) return;
    form.setFieldsValue({
      priority_group: editDevice.priority_group
    })
  }, [editDevice, form])

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
    setEditDevice(null)
    form.resetFields()
  }, [form]);

  const onFinish = (values) => {
    execute({
      id: editDevice.id,
      priority_group: values.priority_group
    })
  };
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  useEffect(() => {
    if (result?.data?.device_edit?.id) {
      handleCancel()
    }
  }, [result, handleCancel])
  
  return (
    <>
      {!!editDevice && (
        <Modal
          title={`Edit Device - ${editDevice.id}`}
          open={isModalOpen}
          onCancel={handleCancel}
          footer={[
            <Button form={`edit_device_form_${editDevice.id}`} type="primary" key="submit" htmlType="submit">
              Submit
            </Button>
          ]}
        >
          <Form
            form={form}
            name={`edit_device_form_${editDevice.id}`}
            labelCol={{
              span: 8,
            }}
            wrapperCol={{
              span: 16,
            }}
            style={{
              maxWidth: 600,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Priority Group"
              name="priority_group"
              rules={[
                {
                  required: true,
                  message: 'Please input priority group',
                },
              ]}
            >
              <Select>
                <Select.Option key={0} value={0}>0 - Disable Rules</Select.Option>
                <Select.Option key={1} value={1}>0 - Active if grid ON</Select.Option>
                {/* <Select.Option value="1">1 - Active if solar ON or grid ON</Select.Option> */}
                <Select.Option key={2} value={2}>2 - Active if grid ON, solar ON, PV - 30% of max power</Select.Option>
                {/* <Select.Option value="3">3</Select.Option> */}
                <Select.Option key={4} value={4}>4 - Active if grid OFF, solar ON</Select.Option>
                {/* <Select.Option value="5">5</Select.Option> */}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      )}
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
        <Column
          title="Action"
          dataIndex="action"
          key="action"
          render={(_, record) => (
            <>
              <Button onClick={() => showModal(record.id)}>Edit</Button>
            </>
          )}
        />
      </Table>
    </>
    
  );
};

export default Devices