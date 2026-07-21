import type { RootState } from 'src/redux/store';
import type { AccountHeadType } from 'src/types/finance/account-head';

import { useSelector } from 'react-redux';
import { useGetAccountHeadOptionsQuery } from 'src/redux/finance/accountHeadApi';

export function useAccountHeadOptions(headType?: AccountHeadType) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const { data, isLoading } = useGetAccountHeadOptionsQuery(
    {
      academicYearId: currentYear?.id,
      headType,
    },
    {
      skip: !currentYear?.id,
    }
  );

  const options = Array.isArray(data) ? data : data?.items || [];

  return {
    options,
    isLoading,
  };
}
