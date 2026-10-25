import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';

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
    <DetailSection
      title="Student Information"
      icon="mdi:account-school-outline"
      helpText="Student identity and academic placement, including the assigned board and education medium."
      sx={{
        mb: 0.75,
        p: 1.5,
        '& .MuiIconButton-root': {
          width: 28,
          height: 28,
          '@media (pointer: coarse)': { width: 44, height: 44 },
        },
      }}
    >
      <DetailGrid desktopColumns={6}>
        {fields.map((field) => (
          <DetailField key={field.label} {...field} />
        ))}
      </DetailGrid>
    </DetailSection>
  );
}
