import type { ReceivingHistoryParams } from 'src/redux/library/receiving-types';

import { useState } from 'react';
import { useGetLibraryReceivingHistoryQuery } from 'src/redux/library/receiving-api';

import { useReceivingAccess } from './useReceivingAccess';

export function useReceivingHistory(copyId?: string) {
  const access = useReceivingAccess();
  const [criteria, setCriteria] = useState<ReceivingHistoryParams>({ page: 1, pageSize: 20 });
  const query = useGetLibraryReceivingHistoryQuery(
    { ...criteria, copyId },
    { skip: !access.canRead, refetchOnMountOrArgChange: true }
  );
  return {
    access,
    query,
    criteria,
    update: (changes: Partial<ReceivingHistoryParams>) =>
      setCriteria((current) =>
        Object.entries(changes).every(([field, value]) =>
          Object.is(current[field as keyof ReceivingHistoryParams], value)
        )
          ? current
          : { ...current, ...changes, page: 1 }
      ),
    paginate: (page: number, pageSize: number) =>
      setCriteria((current) =>
        current.page === page && current.pageSize === pageSize
          ? current
          : { ...current, page, pageSize }
      ),
  };
}
