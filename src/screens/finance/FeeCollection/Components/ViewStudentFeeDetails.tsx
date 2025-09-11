import { Box, Card, Grid, Avatar, Typography } from '@mui/material';

import type { IStudentFee } from './type';

const StudentInfoCard = ({ student }: { student: IStudentFee }) => {
  const fields = [
    { label: 'Student Name', value: student.name },
    { label: 'Roll No.', value: student.rollNumber },
    { label: 'Board', value: student.board },
    { label: 'Medium', value: student.medium },
    { label: 'Class/Division', value: `${student.className}-${student.division}` },
    { label: 'Contact No.', value: student.contactNumber },
    { label: 'Admission Date', value: student.admissionDate },
    { label: 'GR No.', value: student.grNumber },
    { label: 'Parent Name', value: student.parentName },
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
        <Typography variant="h6" gutterBottom sx={{ color: 'sucess.main' }}>
          Student Information
        </Typography>

        <Grid container spacing={1}>
          {/* Left Side: Avatar */}
          <Grid size={{ xs: 12, sm: 2 }} display="flex">
            <Avatar
              src="/assets/images/avatar/default-student.jpg"
              alt={student?.name || 'Student'}
              sx={{ mt: 2, width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 } }}
            />
          </Grid>

          {/* Right Side: Student Details */}
          <Grid size={{ xs: 12, sm: 10 }}>
            <Grid container spacing={2}>
              {fields.map((field) => (
                <Grid size={{ xs: 12, sm: 2 }} key={field.label}>
                  <Typography variant="body2" color="text.secondary">
                    {field.label}
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {field.value}
                  </Typography>
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
