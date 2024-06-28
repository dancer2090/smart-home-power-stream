const Devices = ({ devices }) => {

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
       {devices && devices.map(device => (
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