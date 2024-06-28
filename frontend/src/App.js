import './App.css';
import Devices from './components/Devices';
import Invertor from './components/Invertor';
import { useEffect } from 'react';
import { gql, useQuery } from 'urql';

const Query = gql`
  query {
    invertor {
      ip
      pv_power
      pv_potential
      load
      grid_load
      grid_status      
    }

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
function App() {

  const [result, reexecuteQuery] = useQuery({
    query: Query,
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
    <div className="App">
      <header className="App-header">
        POWER STREAM
      </header>
      <Invertor invertor={data?.invertor} />
      <br />
      <Devices devices={data?.devices} />
    </div>
  );
}

export default App;
