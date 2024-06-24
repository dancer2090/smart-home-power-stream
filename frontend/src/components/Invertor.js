import { useEffect } from 'react';
import { gql, useQuery } from 'urql';

const InvertorQuery = gql`
  query {
    invertor {
      ip
      pv_power
      pv_potential
      load
      grid_load
      grid_status      
    }
  }
`;

const Devices = () => {
  const [result, reexecuteQuery] = useQuery({
    query: InvertorQuery,
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
        <td>IP</td>
        <td>PV Power</td>
        <td>PV Potential</td>
        <td>Load</td>
        <td>Grid Load</td>
        <td>Grid Status</td>
      </thead>
       {data?.invertor && (
        <tr>
          <td>{data?.invertor?.ip}</td>
          <td>{data?.invertor?.pv_power}</td>
          <td>{data?.invertor?.pv_potential}</td>
          <td>{data?.invertor?.load}</td>
          <td>{data?.invertor?.grid_load}</td>
          <td style={{ background: data?.invertor?.grid_status ? 'green' : 'red'}}>{data?.invertor?.grid_status}</td>
        </tr>
      )}
      
    </table>
  );
};

export default Devices