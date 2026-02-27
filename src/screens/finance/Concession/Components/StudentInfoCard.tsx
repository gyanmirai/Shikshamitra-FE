import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Card, Grid, CardContent } from '@mui/material';
import { School, Person, CalendarToday } from '@mui/icons-material';
import { InfoItem } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails';

interface StudentInfoCardProps {
  studentName?: string;
  classDiv?: string;
  boardMedium?: string;
  academicYear?: string;
}

const StudentInfoCard: React.FC<StudentInfoCardProps> = ({
  studentName = '-',
  classDiv = '-',
  boardMedium = '-',
  academicYear = '-',
}) => {
  const theme = useTheme();

  return (
    <Card sx={{ mt: 1, bgcolor: theme.palette.grey[100] }}>
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <InfoItem icon={<Person />} label="Student Name" value={studentName} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <InfoItem icon={<School />} label="Class / Div" value={classDiv} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <InfoItem
              icon={<Iconify icon="solar:book-bookmark-bold-duotone" />}
              label="Board • Medium"
              value={boardMedium}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <InfoItem icon={<CalendarToday />} label="Academic Year" value={academicYear} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StudentInfoCard;
