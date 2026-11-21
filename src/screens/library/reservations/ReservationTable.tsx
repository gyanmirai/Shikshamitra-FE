import type { IColumn } from 'src/components/customizabaleTable/types';
import type { LibraryReservation } from 'src/redux/library/reservation-types';

import CustomizableTable from 'src/components/customizabaleTable';

import { ReservationRowActions } from './ReservationRowActions';
import { reservationDate, ReservationStatus, reservationPerson } from './reservation-display';

import type { ReservationActions } from './ReservationRowActions';

export function ReservationTable({
  items,
  page,
  pageSize,
  totalCount,
  loading,
  refreshing,
  error,
  onPage,
  onRetry,
  ...actions
}: ReservationActions & {
  items: LibraryReservation[];
  page: number;
  pageSize: number;
  totalCount: number;
  loading: boolean;
  refreshing: boolean;
  error?: unknown;
  onPage: (page: number, pageSize: number) => void;
  onRetry: () => void;
}) {
  const columns: IColumn[] = [
    {
      id: 'memberId',
      label: 'Member',
      rowHeader: true,
      minWidth: 200,
      render: (_, row) => reservationPerson(row as LibraryReservation),
    },
    { id: 'state', label: 'State', render: (state) => <ReservationStatus state={Number(state)} /> },
    {
      id: 'requestedDate',
      label: 'Requested date',
      minWidth: 140,
      render: (_, row) => reservationDate(row.requestedDate, row.requestedDateProvenance),
    },
    {
      id: 'requestExpiryDate',
      label: 'Request expiry',
      minWidth: 140,
      render: (_, row) => reservationDate(row.requestExpiryDate, row.requestExpiryDateProvenance),
    },
    {
      id: 'hold',
      label: 'Assigned copy',
      minWidth: 160,
      render: (hold) => hold?.accessionNumber || 'Not allocated',
    },
    {
      id: 'pickupDeadline',
      label: 'Pickup deadline',
      minWidth: 150,
      render: (_, row) =>
        row.hold
          ? reservationDate(row.hold.pickupDeadline, row.hold.pickupDeadlineProvenance)
          : 'Not allocated',
    },
    {
      id: 'actions',
      label: 'Actions',
      sticky: true,
      align: 'center',
      minWidth: 100,
      render: (_, row) => <ReservationRowActions item={row as LibraryReservation} {...actions} />,
    },
  ];
  return (
    <CustomizableTable
      tableId="library-reservations"
      columns={columns.map((column) => ({ ...column, isSort: false, isFilter: false }))}
      data={items}
      variant="embedded"
      serverSidePagination
      page={page - 1}
      rowsPerPage={pageSize}
      totalCount={totalCount}
      onServerPagination={onPage}
      maxServerRowsPerPage={100}
      isLoading={loading}
      isRefreshing={refreshing}
      error={error}
      onRetry={onRetry}
      isSearch={false}
      isFilter={false}
      showExport={false}
      getRowAction={(row) => ({
        label: `View reservation for ${reservationPerson(row as LibraryReservation)}`,
        onClick: () => actions.onView(row as LibraryReservation),
      })}
      noDataText="No reservations match this view."
    />
  );
}
