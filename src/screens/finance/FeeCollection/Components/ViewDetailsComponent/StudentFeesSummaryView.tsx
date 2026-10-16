import type { StudentSummary } from 'src/redux/feeCollection/feeCollection';

import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';

export const StudentFeesSummaryView = ({ student }: { student: StudentSummary }) => (
  <DetailSection title="Student Information" icon="mdi:account-school-outline">
    <DetailGrid>
      <DetailField label="Student name" value={student.name} />
      <DetailField label="GR number" value={student.grNo} />
      <DetailField label="Roll number" value={student.rollNo} />
      <DetailField label="Class" value={student.standardName} />
      <DetailField label="Division" value={student.divisionName} />
      <DetailField label="Contact" value={student.mobileNo} />
    </DetailGrid>
  </DetailSection>
);
