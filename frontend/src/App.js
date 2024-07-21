import './App.css';
import Devices from './components/Devices';
import Invertor from './components/Invertor';
import { useEffect } from 'react';
import { gql, useQuery } from 'urql';
import LayoutApp from './layout'

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

let interval = null

function App() {

  const [result, reexecuteQuery] = useQuery({
    query: Query,
  });

  const { data, error } = result;
  useEffect(() => {
    if (interval) return
    
    interval = setInterval(() => {
      console.log('reexecute')
      reexecuteQuery({ requestPolicy: 'network-only' })
    }, 5000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <p>Oh no... {error.message}</p>;

  return (
    <LayoutApp>
      <Invertor invertor={data?.invertor} />
      <br />
      <Devices devices={data?.devices} />
    </LayoutApp>      
  );
}

export default App;
