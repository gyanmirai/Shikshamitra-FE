import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Card, Grid, Typography, CardContent } from '@mui/material';

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
    <Card sx={{ mb: 1, bgcolor: theme.palette.grey[100] }}>
      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                STUDENT NAME
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                {studentName}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                CLASS / DIV
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                {classDiv}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                BOARD • MEDIUM
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                {boardMedium}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                ACADEMIC YEAR
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                {academicYear}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StudentInfoCard;
