import { gql, useQuery, useMutation } from 'urql';

const GetDevicesListQuery = gql`
  query {
    invertor {
      ip
      pv_power
      pv_potential
      load
      grid_load
      grid_status
      solar_radiation      
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

export const useGetListDevices = () => {
  const [result, reexecuteQuery] = useQuery({
    query: GetDevicesListQuery,
  });

  return { result, reexecuteQuery }
}

const editDeviceMutation = gql`
  mutation EditDeviceMutation($id: String, $priority_group: Int){
    device_edit(id: $id, priority_group: $priority_group) {
      id
      priority_group
    }
  }
`;

export const useEditDevice = () => {
  const [result, execute] = useMutation(editDeviceMutation);

  return { result, execute }
}

  