import type { LibraryReturnLookup } from 'src/redux/library/circulation-types';

import { Alert, Stack } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { fDate } from 'src/utils/format-time';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/components/detail-view';

import { confirmedDate } from './school-date';

export function ReturnLoanDetails({ item }: { item: LibraryReturnLookup }) {
  const { loan, borrower } = item;
  const issued = confirmedDate(loan.schoolIssueDate, loan.issueDateProvenance);
  const due = confirmedDate(loan.schoolDueDate, loan.dueDateProvenance);
  return (
    <FormSectionCard
      title="Saved Loan"
      icon={GlobalIcons.bookIcon}
      descriptionTooltip="Borrower labels use the saved loan snapshot or a currently authorized record. Original timestamps remain unconfirmed until explicitly reviewed."
    >
      <Stack spacing={2}>
        {loan.blockedReasons.map((reason) => (
          <Alert key={reason} severity="warning">
            {reason}
          </Alert>
        ))}
        <DetailGrid>
          <DetailField
            label="Borrower"
            value={borrower.memberName || borrower.memberId || 'Unavailable'}
          />
          <DetailField label="Member ID" value={borrower.memberIdentifier} />
          <DetailField
            label="Role"
            value={borrower.role === 0 ? 'Student' : borrower.role === 1 ? 'Staff' : 'Unavailable'}
          />
          <DetailField label="Class / division" value={borrower.classDivision} />
          <DetailField
            label="Issue date"
            value={issued ? fDate(loan.schoolIssueDate) : 'Unconfirmed'}
          />
          <DetailField label="Due date" value={due ? fDate(loan.schoolDueDate) : 'Unconfirmed'} />
          {!issued && (
            <DetailField label="Stored issue value (unconfirmed)" value={loan.rawIssueDate} />
          )}
          {!due && <DetailField label="Stored due value (unconfirmed)" value={loan.rawDueDate} />}
          <DetailField label="Loan ID" value={loan.id} />
        </DetailGrid>
      </Stack>
    </FormSectionCard>
  );
}
