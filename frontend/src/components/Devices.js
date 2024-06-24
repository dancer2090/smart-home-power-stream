import { useEffect } from 'react';
import { gql, useQuery } from 'urql';

const DevicesQuery = gql`
  query {
    devices {
      id
      device_name
      device_type
      device_ip
      max_power
      active_power
      active_status
      priority_group
    }
  }
`;

const Devices = () => {
  const [result, reexecuteQuery] = useQuery({
    query: DevicesQuery,
  });

  const { data, fetching, error } = result;
  useEffect(() => {
    setInterval(() => {
      console.log('reexecute')
      reexecuteQuery({ requestPolicy: 'network-only' })
    }, 2000)
  }, []);

  // if (fetching) return <p>Loading...</p>;
  if (error) return <p>Oh no... {error.message}</p>;

  

  return (
    <table border="1">
      <thead>
        <td>Device Name</td>
        <td>Device IP</td>
        <td>Active Status</td>
        <td>Active Power</td>
        <td>Max Power</td>
        <td>Priority Group</td>
      </thead>
       {data?.devices && data.devices.map(device => (
        <tr>
          <td>{device.device_name}</td>
          <td>{device.device_ip}</td>
          <td style={{ background: device?.active_status ? 'green' : 'red'}}>{device.active_status}</td>
          <td>{device.active_power}</td>
          <td>{device.max_power}</td>
          <td>{device.priority_group}</td>
        </tr>
      ))}
      
    </table>
  );
};

export default Devices