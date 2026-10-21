import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useGetSchoolDocumentsQuery } from 'src/redux/InstituteSetup/schoolDocumentsApi';

import { useDocumentPermissions } from './use-document-permissions';

export function useDocumentWorkspace() {
  const permissions = useDocumentPermissions();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [selection, setSelection] = useState<{ id: string; mode: 'view' | 'edit' } | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);
  const pageValue = Number(params.get('page') ?? '0');
  const page = Number.isInteger(pageValue) && pageValue >= 0 ? pageValue : 0;
  const sizeValue = Number(params.get('size') ?? '10');
  const size = [10, 25, 50].includes(sizeValue) ? sizeValue : 10;
  const search = params.get('search') ?? '';
  const categoryValue = params.get('category');
  const category =
    categoryValue !== null && /^[0-4]$/.test(categoryValue) ? Number(categoryValue) : undefined;
  const requestedSort = params.get('sort') ?? '';
  const sorting = ['name asc', 'name desc', 'creationTime asc', 'creationTime desc'].includes(
    requestedSort
  )
    ? requestedSort
    : undefined;
  const query = useGetSchoolDocumentsQuery(
    {
      skipCount: page * size,
      maxResultCount: size,
      search,
      category,
      sorting,
    },
    { skip: !permissions.canView }
  );
  const changeCriteria = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (value === undefined || value === '') next.delete(key);
      else next.set(key, value);
    });
    router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false });
  };
  return {
    permissions,
    query,
    page,
    size,
    search,
    category,
    sorting,
    changeCriteria,
    selection,
    setSelection,
    adding,
    setAdding,
    deleting,
    setDeleting,
  };
}

export type DocumentWorkspace = ReturnType<typeof useDocumentWorkspace>;
