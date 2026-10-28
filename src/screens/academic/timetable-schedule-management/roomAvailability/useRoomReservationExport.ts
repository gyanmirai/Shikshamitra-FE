import type { TableExportRequest } from 'src/components/customizabaleTable/types';
import type { ReservationPageInput } from 'src/redux/academicAPI/timetableApi/roomReadContracts';

import { exportTable } from 'src/components/customizabaleTable/table-export';
import { useLazyGetReservationPageQuery } from 'src/redux/academicAPI/timetableApi/roomAvailabilityApi';

import { roomReservationRead } from './roomReservationRead';

import type { RoomReservation } from './types';

export function useRoomReservationExport(scope: Omit<ReservationPageInput, 'skipCount' | 'maxResultCount'>) {
  const [loadPage] = useLazyGetReservationPageQuery();
  return async (request: TableExportRequest) => {
    const rows: RoomReservation[] = [];
    const collectPage = async (skipCount: number): Promise<void> => {
      request.signal?.throwIfAborted();
      const pending = loadPage({ ...scope, skipCount, maxResultCount: 250, searchTerm: request.searchTerm,
        filters: JSON.stringify(request.filters), sorting: request.sorts.map(sort => `${sort.column} ${sort.direction}`).join(',') });
      const abort = () => pending.abort();
      request.signal?.addEventListener('abort', abort, { once: true });
      let hasMore = false;
      try {
        const result = await pending.unwrap();
        rows.push(...result.items.map(roomReservationRead));
        hasMore = rows.length < result.totalCount && result.items.length > 0;
      } finally { request.signal?.removeEventListener('abort', abort); pending.unsubscribe(); }
      if (hasMore) await collectPage(rows.length);
    };
    await collectPage(0);
    request.signal?.throwIfAborted();
    await exportTable({ format: request.format, columns: request.columns,
      columnVisibility: Object.fromEntries(request.columns.map(column => [column.id, true])), rows,
      tableTitle: scope.isApprovalView ? 'Pending Approvals' : 'Room Reservations', beforeDownload: () => request.signal?.throwIfAborted() });
  };
}
