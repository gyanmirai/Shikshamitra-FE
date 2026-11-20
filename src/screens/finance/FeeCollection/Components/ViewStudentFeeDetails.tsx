import { Box, Card, Grid, Avatar, Typography } from '@mui/material';
import { DetailField } from 'src/screens/finance/components/detail-view';

import type { IStudentFee } from './type';

const StudentInfoCard = ({ student }: { student: IStudentFee }) => {
  const fields = [
    { label: 'Student name', value: student.name },
    { label: 'Roll number', value: student.rollNumber },
    { label: 'Board', value: student.board },
    { label: 'Medium', value: student.medium },
    { label: 'Class / division', value: `${student.className}-${student.division}` },
    { label: 'Contact no.', value: student.contactNumber },
    { label: 'Admission date', value: student.admissionDate },
    { label: 'GR number', value: student.grNumber },
    { label: 'Parent name', value: student.parentName },
    { label: 'Email', value: student.email },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Card
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          boxShadow: 3,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
          Student Information
        </Typography>

        <Grid container spacing={1}>
          {/* Left Side: Avatar */}
          <Grid size={{ xs: 12, sm: 1 }} display="flex">
            <Avatar
              src="/assets/images/avatar/default-student.jpg"
              alt={student?.name || 'Student'}
              sx={{ mt: 2, width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 } }}
            />
          </Grid>

          {/* Right Side: Student Details */}
          <Grid size={{ xs: 12, sm: 11 }}>
            <Grid container spacing={2}>
              {fields.map((field) => (
                <Grid size={{ xs: 12, sm: 2 }} key={field.label}>
                  <DetailField label={field.label} value={field.value} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default StudentInfoCard;
