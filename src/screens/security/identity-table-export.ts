import type { AppDispatch } from 'src/redux/store';
import type { IdentityListQuery } from 'src/redux/identity-list';
import type { IData, TableExportRequest } from 'src/components/customizabaleTable/types';

import { userApi } from 'src/redux/user/userApi';
import { roleApi } from 'src/redux/role/roleApi';
import { exportTable } from 'src/components/customizabaleTable/table-export';

import { getUserDisplayName } from './user/user-record';

export async function exportIdentityTable(
  dispatch: AppDispatch,
  kind: 'users' | 'roles',
  params: IdentityListQuery,
  request: TableExportRequest
) {
  const rows: IData[] = [];
  let totalCount = 0;
  do {
    request.signal?.throwIfAborted();
    const query = {
      ...params,
      filter: request.searchTerm.trim(),
      skipCount: rows.length,
      maxResultCount: 1000,
    };
    const result =
      kind === 'users'
        ? dispatch(
            userApi.endpoints.getUserDirectory.initiate(query, {
              subscribe: false,
              forceRefetch: true,
            })
          )
        : dispatch(
            roleApi.endpoints.getRolePage.initiate(query, { subscribe: false, forceRefetch: true })
          );
    const abort = () => result.abort();
    request.signal?.addEventListener('abort', abort, { once: true });
    try {
      // eslint-disable-next-line no-await-in-loop -- Each export offset depends on the preceding page.
      const page = await result.unwrap();
      if (
        !Array.isArray(page.items) ||
        !Number.isFinite(page.totalCount) ||
        (page.items.length === 0 && rows.length < page.totalCount)
      ) {
        throw new Error('The export response is incomplete. Please retry.');
      }
      rows.push(...page.items);
      ({ totalCount } = page);
    } finally {
      request.signal?.removeEventListener('abort', abort);
      result.unsubscribe();
    }
  } while (rows.length < totalCount);
  request.signal?.throwIfAborted();
  await exportTable({
    format: request.format,
    columns: request.columns,
    columnVisibility: Object.fromEntries(request.columns.map((column) => [column.id, true])),
    rows:
      kind === 'users'
        ? rows.map((row) => ({
            ...row,
            userName: getUserDisplayName(row as Parameters<typeof getUserDisplayName>[0]),
          }))
        : rows,
    tableTitle: kind === 'users' ? 'User Management' : 'Role Management',
    beforeDownload: () => request.signal?.throwIfAborted(),
  });
}
