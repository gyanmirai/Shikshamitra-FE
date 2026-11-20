import type { LibraryCirculationMember } from 'src/redux/library/circulation-members-api';

import { Alert } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/components/detail-view';

import { MemberOverdueValue } from './MemberOverdueValue';

export function IssueMemberDetails({ member }: { member: LibraryCirculationMember }) {
  return (
    <FormSectionCard
      title="Borrower Details"
      icon={GlobalIcons.studentProfile}
      descriptionTooltip="Borrowing totals include the loan and reservation records you can access. The issue preview checks the applicable borrowing limit."
    >
      <DetailGrid>
        <DetailField label="Name" value={member.memberName} />
        <DetailField label="Member ID" value={member.memberIdentifier} />
        <DetailField
          label="Role"
          value={member.role === 0 ? 'Student' : member.role === 1 ? 'Staff' : 'Unavailable'}
        />
        {member.role === 0 && <DetailField label="Class/division" value={member.classDivision} />}
        <DetailField label="Current issues" value={member.statistics.currentIssue} />
        <DetailField
          label="Overdue books"
          value={
            <MemberOverdueValue
              count={member.statistics.overdueReturnBooks}
              classification={member.statistics}
            />
          }
        />
        <DetailField label="Reserved books" value={member.statistics.reservedBooks} />
      </DetailGrid>
      {!member.isEligibleForIssue && (
        <Alert severity="warning">
          {member.ineligibilityReason || 'This borrower is not eligible for a new issue.'}
        </Alert>
      )}
    </FormSectionCard>
  );
}
