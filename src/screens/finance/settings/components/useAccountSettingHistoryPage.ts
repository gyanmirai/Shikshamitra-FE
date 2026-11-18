import { useState, useEffect } from 'react';

export const ACCOUNT_HISTORY_PAGE_SIZE = 50;

export function useAccountSettingHistoryPage(id?: string) {
  const [position, setPosition] = useState({ id, page: 0 });
  const page = position.id === id ? position.page : 0;
  useEffect(() => { setPosition({ id, page: 0 }); }, [id]);
  return {
    page,
    pageSize: ACCOUNT_HISTORY_PAGE_SIZE,
    query: { id: id || '', skipCount: page * ACCOUNT_HISTORY_PAGE_SIZE, maxResultCount: ACCOUNT_HISTORY_PAGE_SIZE },
    onPageChange: (nextPage: number) => setPosition({ id, page: nextPage }),
  };
}
