import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  MemberBookRecord,
  MemberRecordKind,
} from 'src/redux/library/libraryMembers/member-record-types';

import { LoanSchoolDate } from '../../../circulation/LoanSchoolDate';
import { ReservationStatus } from '../../../reservations/reservation-display';
import { MemberLoanState, MemberRecordTitle } from './member-record-cells';

export function memberRecordColumns(kind: MemberRecordKind): IColumn[] {
  const columns: IColumn[] = [
    {
      id: 'bookTitle',
      label: 'Book title',
      rowHeader: true,
      sticky: true,
      render: (_, item) => <MemberRecordTitle row={item as MemberBookRecord} />,
    },
    { id: 'bookCategory', label: 'Book category' },
  ];
  if (kind === 'reserved')
    columns.push(
      {
        id: 'requestedDate',
        label: 'Requested on',
        render: (_, item) => {
          const row = item as MemberBookRecord;
          return (
            <LoanSchoolDate
              value={row.requestedDate}
              provenance={row.requestedDateProvenance}
              raw={row.reservedOn}
            />
          );
        },
      },
      {
        id: 'state',
        label: 'Request state',
        render: (_, item) => <ReservationStatus state={(item as MemberBookRecord).state ?? -1} />,
      },
      { id: 'author', label: 'Author' },
      { id: 'reservedOn', label: 'Preserved raw request value', defaultHidden: true }
    );
  else
    columns.push(
      { id: 'accessionNo', label: 'Accession number' },
      {
        id: 'schoolIssueDate',
        label: 'Issued on',
        render: (_, item) => {
          const row = item as MemberBookRecord;
          return (
            <LoanSchoolDate
              value={row.schoolIssueDate}
              provenance={row.issueDateProvenance}
              raw={row.issuedOn}
            />
          );
        },
      },
      {
        id: 'schoolDueDate',
        label: 'Due on',
        render: (_, item) => {
          const row = item as MemberBookRecord;
          return (
            <LoanSchoolDate
              value={row.schoolDueDate}
              provenance={row.dueDateProvenance}
              raw={row.dueOn}
            />
          );
        },
      },
      { id: 'issuedOn', label: 'Preserved raw issue value', defaultHidden: true },
      { id: 'dueOn', label: 'Preserved raw due value', defaultHidden: true }
    );
  if (kind === 'history')
    columns.push(
      {
        id: 'schoolReturnDate',
        label: 'Returned on',
        render: (_, item) => {
          const row = item as MemberBookRecord;
          return (
            <LoanSchoolDate
              value={row.schoolReturnDate}
              provenance={row.returnDateProvenance}
              raw={row.returnedOn}
            />
          );
        },
      },
      {
        id: 'storedStatus',
        label: 'Recorded loan state',
        render: (_, item) => <MemberLoanState status={(item as MemberBookRecord).storedStatus} />,
      },
      { id: 'returnedOn', label: 'Preserved raw return value', defaultHidden: true }
    );
  columns.push({
    id: 'academicYearId',
    label: 'Recorded year ID',
    cellSx: { overflowWrap: 'anywhere' },
    render: (value) => value || 'Unconfirmed',
  });
  return columns.map((column) => ({
    ...column,
    align: 'left' as const,
    isSort: false,
    isFilter: false,
  }));
}
