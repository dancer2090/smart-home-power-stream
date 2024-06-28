const Invertor = ({ invertor }) => {
  
  return (
    <table border="1">
      <thead>
        <td>IP</td>
        <td>PV Power</td>
        <td>PV Potential</td>
        <td>Load</td>
        <td>Grid Load</td>
        <td>Grid Status</td>
      </thead>
       {invertor && (
        <tr>
          <td>{invertor?.ip}</td>
          <td>{invertor?.pv_power}</td>
          <td>{invertor?.pv_potential}</td>
          <td>{invertor?.load}</td>
          <td>{invertor?.grid_load}</td>
          <td style={{ background: invertor?.grid_status ? 'green' : 'red'}}>{invertor?.grid_status}</td>
        </tr>
      )}
      
    </table>
  );
};

export default Invertor