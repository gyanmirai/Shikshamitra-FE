import type { RootState } from 'src/redux/store';
import type { LibraryPaginatedList } from 'src/redux/library/library-adapters';
import type { IBook } from 'src/screens/library/BookManagement/Components/type';

import { useSelector } from 'react-redux';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useGetAllBooksQuery } from 'src/redux/library/bookList/bookList-api';

import { readCatalogQuery, changeCatalogQuery } from './catalog-query';

export function useCatalogPage() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = (currentYear as { id?: string })?.id;
  const location = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const params = new URLSearchParams(location.toString());
  const criteria = readCatalogQuery(params, academicYearId);
  const query = useGetAllBooksQuery(
    {
      academicYearId,
      page: criteria.page,
      pageSize: criteria.pageSize,
      ...(criteria.search.trim() && { search: criteria.search.trim() }),
      ...(criteria.alphabet !== 'ALL' && { alphabet: criteria.alphabet }),
    },
    { skip: !academicYearId, refetchOnMountOrArgChange: true }
  );

  const update = (changes: Record<string, string | number>) => {
    const next = changeCatalogQuery(params, academicYearId, changes);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return {
    ...query,
    currentData: query.currentData as LibraryPaginatedList<IBook> | undefined,
    academicYearId,
    criteria,
    update,
  };
}
