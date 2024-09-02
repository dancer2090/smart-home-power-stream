import { gql, useQuery } from 'urql';

const GetHistoryQuery = gql`
  query($from: DateTime!, $to: DateTime!) {
    history(from: $from, to: $to) {
      pv_power
      solar_radiation
      load
      grid_load
      grid_status
      created_at
    }
  }
`;

export const useGetHistory = (from, to) => {
  const [result, reexecuteQuery] = useQuery({
    query: GetHistoryQuery,
    variables: { from, to }
  });

  return { result, reexecuteQuery }
}

