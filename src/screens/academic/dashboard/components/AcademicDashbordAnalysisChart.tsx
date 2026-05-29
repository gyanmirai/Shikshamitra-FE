/**
 * AcademicDashbordAnalysisChart
 *
 * This component displays an analysis chart summarizing student performance distribution
 * across four categories: Excellent, Good, Average, and Needs Improvement. It provides
 * a quick visual overview of how students are performing academically, helping educators
 * identify strengths and areas that may require additional support or intervention.
 */
import React from 'react';
import { Card } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnalyticsCurrentVisits } from 'src/screens/student/enrollment/dashboard/organization-status';

const AcademicDashbordAnalysisChart = () => {
  const theme = useTheme();
  return (
    <Card sx={{ height: '100%', p: 2 }}>
      <div>
        <strong>Analysis Chart</strong>
        <div style={{ color: theme.palette.text.secondary, fontSize: 14, marginBottom: 12 }}>
          This chart summarizes student performance distribution across four categories: Excellent,
          Good, Average, and Needs Improvement. It helps quickly identify strengths and areas
          needing support.
        </div>
      </div>
      <AnalyticsCurrentVisits
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
