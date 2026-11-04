import { GlobalIcons } from 'src/utils/icons';
import { DetailGrid, DetailField } from 'src/components/detail-view';
import { FormSectionCard } from 'src/components/form-section-card';
import type { AdjustmentRequest } from '../types/adjustment.types';

export default function AdjustmentStudentCard({ adjustment }: { adjustment: AdjustmentRequest }) {
  const fields = [
    { label: 'Student name', value: adjustment.studentName },
    { label: 'GR no.', value: adjustment.studentGrNo },
    { label: 'Roll no.', value: adjustment.rollNumber },
    {
      label: 'Class / Division',
      value: [adjustment.className, adjustment.divisionName].filter(Boolean).join(' / '),
    },
    ...(adjustment.contactNo ? [{ label: 'Contact no.', value: adjustment.contactNo }] : []),
  ];
  return (
    <FormSectionCard
      sx={{ containerType: 'inline-size', minWidth: 0 }}
      title="Student Information"
      icon={GlobalIcons.assigned}
      descriptionTooltip="The student and academic details associated with this adjustment request."
    >
      <DetailGrid desktopColumns={4}>
        {fields.map((field) => (
          <DetailField
            key={field.label}
            {...field}
          />
        ))}
      </DetailGrid>
    </FormSectionCard>
  );
}
