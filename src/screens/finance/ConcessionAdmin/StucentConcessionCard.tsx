import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/components/detail-view';

type StudentInformation = {
  name?: string;
  studentName?: string;
  grNumber?: string | number;
  rollNo?: string;
  standardName?: string;
  divisionName?: string;
  boardName?: string;
  educationMediumName?: string;
  boardMedium?: string;
};

export default function StudentInformationAccordion({
  student,
}: {
  student: StudentInformation | null;
}) {
  const boardMedium =
    student?.boardName || student?.educationMediumName
      ? `${student.boardName || '—'} / ${student.educationMediumName || '—'}`
      : student?.boardMedium;
  const fields = [
    { label: 'Student name', value: student?.name || student?.studentName },
    { label: 'GR number', value: student?.grNumber },
    { label: 'Roll number', value: student?.rollNo },
    { label: 'Class', value: student?.standardName },
    { label: 'Division', value: student?.divisionName },
    { label: 'Board / medium', value: boardMedium },
  ];
  return (
    <FormSectionCard
      title="Student Information"
      icon="mdi:account-school-outline"
      iconSize={16}
      iconContainerSize={28}
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      descriptionTooltip="Student identity and academic placement, including the assigned board and education medium."
      sx={{
        mb: 2,
        containerType: 'inline-size',
        minWidth: 0,
        boxShadow: 'none',
        bgcolor: 'background.paper',
      }}
    >
      <DetailGrid desktopColumns={6}>
        {fields.map((field) => (
          <DetailField
            key={field.label}
            {...field}
            labelTypographyProps={{
              color: 'text.secondary',
              sx: { fontWeight: 400, letterSpacing: 'normal', textTransform: 'none' },
            }}
          />
        ))}
      </DetailGrid>
    </FormSectionCard>
  );
}
