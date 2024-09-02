import React from 'react';
import { useEffect } from 'react';
import { useGetListDevices } from '../queries/listDevices'
import Devices from '../components/Devices';
import Invertor from '../components/Invertor';

let interval = null

const Main = () => {
  const { result, reexecuteQuery } = useGetListDevices();

  const { data, error } = result;
  useEffect(() => {
    if (interval) return
    
    interval = setInterval(() => {
      console.log('reexecute')
      reexecuteQuery({ requestPolicy: 'network-only' })
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <p>Oh no... {error.message}</p>;
  return (
    <>
      <Invertor invertor={data?.invertor} />
      <br />
      <Devices devices={data?.devices} />
    </>
  )
}

export default Main;