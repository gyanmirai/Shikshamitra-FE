import { Box, Card, Grid, Typography } from '@mui/material';

import type { IStudentFee } from './type';

const StudentInfoCard = ({ student }: { student: IStudentFee }) => {
  const fields = [
    { label: 'Student Name', value: student.name },
    { label: 'Roll No.', value: student.rollNumber },
    { label: 'Class/Division', value: `${student.className}-${student.division}` },
    { label: 'Contact No.', value: student.contactNumber },
    { label: 'Admission Date', value: student.admissionDate },
    { label: 'GR No.', value: student.grNumber },
    { label: 'Parent Name', value: student.parentName },
    { label: 'Email', value: student.email },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
      <Card sx={{ p: 3, borderRadius: 2, border: '1px solid black' }}>
        <Typography variant="subtitle1" color="primary.main">
          Student Information
        </Typography>

        <Grid container spacing={1}>
          {fields.map((field) => (
            <Grid item xs={12} sm={6} md={3} key={field.label}>
              <Typography variant="caption" color="text.secondary">
                {field.label}
              </Typography>
              <Typography>{field.value}</Typography>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Box>
  );
};

export default StudentInfoCard;
