import { Box, Grid, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import type { SubjectDependencyMetric } from '../subjectUsage.types';

interface SubjectUsageMetricsSectionProps {
  metrics: SubjectDependencyMetric[];
  dependentModuleCount: number;
}

export function SubjectUsageMetricsSection({
  metrics,
  dependentModuleCount,
}: SubjectUsageMetricsSectionProps) {
  return (
    <FormSectionCard
      icon="solar:chart-2-linear"
      title="Dependencies & usage"
      description={`${dependentModuleCount} active module${dependentModuleCount === 1 ? '' : 's'} currently reference this subject.`}
    >
      <Grid container spacing={1}>
        {metrics.map((metric) => (
          <Grid key={metric.label} size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                p: 1.25,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                minHeight: 64,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {metric.label}
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: 0.25 }}>
                {metric.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </FormSectionCard>
  );
}
