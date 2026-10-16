import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';

import type { IStudentInfo } from '../Concession/type';

export default function StudentInformationAccordion({ student }: { student: IStudentInfo | null }) {
  return (
    <DetailSection title="Student Information" icon="mdi:account-school-outline" sx={{ mb: 2 }}>
      <DetailGrid>
        <DetailField label="Student name" value={student?.name} />
        <DetailField label="GR number" value={student?.grNumber} />
        <DetailField label="Roll number" value={student?.rollNo} />
        <DetailField label="Class" value={student?.standardName} />
        <DetailField label="Division" value={student?.divisionName} />
        <DetailField label="Board / medium" value={student?.boardMedium} />
      </DetailGrid>
    </DetailSection>
  );
}
