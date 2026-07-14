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
import { AnalyticsCurrentVisits } from 'src/components/dashboard/analytics-current-visits';

type AnalysisChartProps = {
  chartData?: {
    excellent: number;
    good: number;
    average: number;
    needsImprovement: number;
  };
};

const AcademicDashbordAnalysisChart = ({ chartData }: AnalysisChartProps) => {
  const theme = useTheme();

  const excellentVal = chartData?.excellent ?? 30;
  const goodVal = chartData?.good ?? 40;
  const averageVal = chartData?.average ?? 20;
  const needsImprovementVal = chartData?.needsImprovement ?? 10;

  const total = excellentVal + goodVal + averageVal + needsImprovementVal;
  const getPct = (val: number) => (total > 0 ? Math.round((val / total) * 100) : 0);

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
            { label: `Excellent (${getPct(excellentVal)}%)`, value: excellentVal },
            { label: `Good (${getPct(goodVal)}%)`, value: goodVal },
            { label: `Average (${getPct(averageVal)}%)`, value: averageVal },
            {
              label: `Needs Improvement (${getPct(needsImprovementVal)}%)`,
              value: needsImprovementVal,
            },
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
