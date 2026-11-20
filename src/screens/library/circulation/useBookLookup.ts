import { useGetCirculationCopyQuery } from 'src/redux/library/circulation-api';

import { useSettledText } from './useSettledText';

export function useBookLookup(value: string, enabled = true) {
  const token = value.trim();
  const settled = useSettledText(value);
  const query = useGetCirculationCopyQuery(
    { scan: settled },
    { skip: !enabled || !token || !settled, refetchOnMountOrArgChange: true }
  );
  const matches = token === settled;
  return {
    ...query,
    currentData: enabled && matches && !query.isError ? query.currentData : undefined,
    error: matches ? query.error : undefined,
    pending: Boolean(token) && (!matches || query.isFetching),
  };
}
