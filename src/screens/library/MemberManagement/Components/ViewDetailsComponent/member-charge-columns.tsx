import type { IColumn } from 'src/components/customizabaleTable/types';
import type { MemberChargeRecord } from 'src/redux/library/libraryMembers/member-charge-types';

import { MemberRecordTitle } from './member-record-cells';
import { MemberChargePosition } from './MemberChargePosition';
import { LoanSchoolDate } from '../../../circulation/LoanSchoolDate';
import { MemberChargeAssessment, MemberChargeDeclaration } from './MemberChargeAssessment';

const columns: IColumn[] = [
  {
    id: 'bookTitle',
    label: 'Book title',
    rowHeader: true,
    sticky: true,
    minWidth: 170,
    render: (_, item) => {
      const row = item as MemberChargeRecord;
      return (
        <MemberRecordTitle
          row={{
            bookTitle: row.bookTitle ?? undefined,
            copyLinkSource: row.copyLinkSource,
            requiresCopyReconciliation: row.requiresCopyReconciliation,
          }}
        />
      );
    },
  },
  { id: 'chargeType', label: 'Charge type' },
  { id: 'bookCategory', label: 'Book category', defaultHidden: true },
  { id: 'accessionNo', label: 'Accession number' },
  {
    id: 'amountText',
    label: 'Original assessment',
    minWidth: 150,
    render: (_, row) => <MemberChargeAssessment row={row as MemberChargeRecord} />,
  },
  {
    id: 'paymentStatus',
    label: 'Recorded declaration',
    render: (status) => <MemberChargeDeclaration status={status} />,
  },
  {
    id: 'schoolChargeDate',
    label: 'Charged on',
    render: (_, row) => (
      <LoanSchoolDate
        value={row.schoolChargeDate}
        provenance={row.chargeDateProvenance}
        raw={row.date}
      />
    ),
  },
  {
    id: 'schoolDueDate',
    label: 'Due on',
    render: (_, row) => (
      <LoanSchoolDate value={row.schoolDueDate} provenance={row.dueDateProvenance} />
    ),
  },
  {
    id: 'financePosition',
    label: 'Finance position',
    minWidth: 300,
    render: (position) => <MemberChargePosition position={position} />,
  },
  {
    id: 'academicYearId',
    label: 'Recorded year ID',
    cellSx: { overflowWrap: 'anywhere' },
    render: (value) => value || 'Unconfirmed',
  },
  { id: 'reason', label: 'Reason', defaultHidden: true },
];

export const memberChargeColumns = columns.map((column) => ({
  ...column,
  isSort: false,
  isFilter: false,
  align: 'left' as const,
}));
