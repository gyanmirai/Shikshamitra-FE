import type { IColumn } from 'src/components/customizabaleTable/types';

import { LoanSchoolDate } from './LoanSchoolDate';
import { LoanMemberCell } from './LoanMemberCell';

import type { LibraryLoanRow } from './loan-types';

export function loanReadColumns(): IColumn[] {
  return [
    {
      id: 'memberName',
      label: 'Member name',
      rowHeader: true,
      sticky: true,
      render: (_, row) => <LoanMemberCell row={row as LibraryLoanRow} />,
    },
    { id: 'memberIdentifier', label: 'Member ID' },
    { id: 'memberId', label: 'Member record ID', defaultHidden: true },
    { id: 'role', label: 'Role' },
    { id: 'bookTitle', label: 'Book title' },
    { id: 'accessionNo', label: 'Accession number' },
    { id: 'classDivision', label: 'Borrower class/division' },
    {
      id: 'academicYearId',
      label: 'Recorded loan year ID',
      cellSx: { overflowWrap: 'anywhere' },
      render: (value) => value || 'Unconfirmed',
    },
    { id: 'bookCategory', label: 'Book category', defaultHidden: true },
    {
      id: 'schoolIssueDate',
      label: 'Issued on',
      render: (_, item) => {
        const row = item as LibraryLoanRow;
        return (
          <LoanSchoolDate
            value={row.schoolIssueDate}
            provenance={row.issueDateProvenance}
            raw={row.rawIssueDate}
          />
        );
      },
    },
    {
      id: 'schoolDueDate',
      label: 'Due on',
      render: (_, item) => {
        const row = item as LibraryLoanRow;
        return (
          <LoanSchoolDate
            value={row.schoolDueDate}
            provenance={row.dueDateProvenance}
            raw={row.rawDueDate}
          />
        );
      },
    },
    {
      id: 'schoolReturnDate',
      label: 'Returned on',
      render: (_, item) => {
        const row = item as LibraryLoanRow;
        return (
          <LoanSchoolDate
            value={row.schoolReturnDate}
            provenance={row.returnDateProvenance}
            raw={row.rawReturnDate}
          />
        );
      },
    },
    { id: 'rawIssueDate', label: 'Preserved raw issue value', defaultHidden: true },
    { id: 'rawDueDate', label: 'Preserved raw due value', defaultHidden: true },
    { id: 'rawReturnDate', label: 'Preserved raw return value', defaultHidden: true },
  ];
}
