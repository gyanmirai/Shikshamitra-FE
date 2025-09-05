import React from 'react';
import { Card } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnalyticsCurrentVisits } from 'src/screens/student/enrollment/dashboard/organization-status';

const AcademicDashbordAnalysisChart = () => {
  const theme = useTheme();
  return (
    <Card sx={{ height: '100%' }}>
      <AnalyticsCurrentVisits
        title="Analysis Chart"
        chart={{
          series: [
            { label: 'High Performance (45%)', value: 45 },
            { label: 'Average (35%)', value: 35 },
            { label: 'Low Performance (20%)', value: 20 },
          ],
          colors: [
            theme.palette.success.main, // Green for High Performance
            theme.palette.warning.main, // Orange for Average
            theme.palette.info.main, // Blue for Low Performance
          ],
        }}
        sx={{ boxShadow: 'none' }}
      />
    </Card>
  );
};

export default AcademicDashbordAnalysisChart;
