import type { LibraryLoan } from 'src/redux/library/circulation-types';

import { GlobalIcons } from 'src/utils/icons';
import { fDate } from 'src/utils/format-time';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/components/detail-view';

import { confirmedDate } from './school-date';

export function LoanMaintenanceFacts({
  loan,
  accessionNo,
}: {
  loan: LibraryLoan;
  accessionNo: string;
}) {
  const date = (value: string | null, provenance: number) =>
    confirmedDate(value, provenance) ? fDate(value) : 'Unconfirmed';
  const year = loan.schoolContext?.academicYears.find((item) => item.id === loan.academicYearId);
  return (
    <FormSectionCard
      title="Saved Loan"
      icon={GlobalIcons.issueBook}
      descriptionTooltip="These saved school dates, source year and borrowing terms belong to this exact loan. Preserved timestamps remain unconfirmed evidence."
    >
      <DetailGrid>
        <DetailField label="Accession number" value={accessionNo} />
        <DetailField label="Loan record" value={loan.id} />
        <DetailField label="Copy record" value={loan.copyId} />
        <DetailField
          label="Recorded loan year"
          value={year?.name || loan.academicYearId || 'Unconfirmed'}
        />
        <DetailField
          label="Saved issue date"
          value={date(loan.schoolIssueDate, loan.issueDateProvenance)}
        />
        <DetailField
          label="Saved due date"
          value={date(loan.schoolDueDate, loan.dueDateProvenance)}
        />
        <DetailField
          label="Original school due date"
          value={loan.originalSchoolDueDate ? fDate(loan.originalSchoolDueDate) : 'Unconfirmed'}
        />
        <DetailField
          label="Saved return date"
          value={date(loan.schoolReturnDate, loan.returnDateProvenance)}
        />
        <DetailField label="Renewals recorded" value={loan.renewalCount} />
        <DetailField
          label="Saved policy version"
          value={loan.policy?.isLegacyManualDate ? 'Legacy manual terms' : loan.policy?.version}
        />
        {loan.rawIssueDate && (
          <DetailField label="Preserved issue timestamp (unconfirmed)" value={loan.rawIssueDate} />
        )}
        {loan.rawDueDate && (
          <DetailField label="Preserved due timestamp (unconfirmed)" value={loan.rawDueDate} />
        )}
        {loan.rawReturnDate && (
          <DetailField
            label="Preserved return timestamp (unconfirmed)"
            value={loan.rawReturnDate}
          />
        )}
      </DetailGrid>
    </FormSectionCard>
  );
}
