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
            { label: 'Excellent (30%)', value: 30 },
            { label: 'Good (40%)', value: 40 },
            { label: 'Average (20%)', value: 20 },
            { label: 'Needs Improvement (10%)', value: 10 },
          ],
          colors: [
            theme.vars.palette.success.main, // Green for Excellent
            theme.vars.palette.info.main, // Blue for Good
            theme.vars.palette.warning.main, // Orange for Average
            theme.vars.palette.error.main, // Red for Needs Improvement
          ],
        }}
        sx={{ boxShadow: 'none' }}
      />
    </Card>
  );
};

export default AcademicDashbordAnalysisChart;
