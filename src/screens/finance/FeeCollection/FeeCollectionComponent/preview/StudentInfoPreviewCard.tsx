import { Box, Card, Grid, Divider, Typography } from '@mui/material';

import type { IStudentFee } from '../../Components/type';

interface Props {
  student: IStudentFee | null;
  academicYear?: string;
  feeStructureName?: string;
}

const InfoItem = ({ label, value }: { label: string; value?: string | number | null }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600} color="text.primary">
      {value ?? '—'}
    </Typography>
  </Box>
);

const StudentInfoPreviewCard = ({ student, academicYear, feeStructureName }: Props) => {
  if (!student) return null;

  return (
    <Card variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper', mb: 0.5 }}>
      <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.primary">
        Student Information
      </Typography>
      <Divider sx={{ mb: 1.5 }} />
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 4, sm: 3 }}>
          <InfoItem label="Student Name" value={student.name || 'Aarav Sharma'} />
        </Grid>
        <Grid size={{ xs: 4, sm: 3 }}>
          <InfoItem
            label="Admission No."
            value={student.grNumber || student.rollNumber || 'GR001'}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <InfoItem
            label="Class & Division"
            value={`${student.className || '10'}${student.division || 'A' ? ` - ${student.division || 'A'}` : ''}`}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <InfoItem label="Academic Year" value={academicYear || '2025-26'} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <InfoItem label="Fee Structure" value={feeStructureName || 'Standard Fee Structure'} />
        </Grid>
      </Grid>
    </Card>
  );
};

export default StudentInfoPreviewCard;
