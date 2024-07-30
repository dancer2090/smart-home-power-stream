import './App.css';
import Devices from './components/Devices';
import Invertor from './components/Invertor';
import { useEffect } from 'react';
import { useGetListDevices } from './queries/listDevices'
import LayoutApp from './layout'

let interval = null

function App() {

  const { result, reexecuteQuery } = useGetListDevices();

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
