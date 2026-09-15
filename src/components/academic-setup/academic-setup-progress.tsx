import { Iconify } from 'src/components/iconify';
import { Box, Paper, Skeleton, Typography } from '@mui/material';

import { AcademicSetupLevel } from './academic-setup-level';
import {
  HIERARCHY_LEVELS,
  getHierarchyCoverage,
  getHierarchyNextStep,
} from './academic-setup-progress-model';

import type { HierarchyCounts } from './academic-setup-model';

type AcademicSetupProgressProps = { counts: HierarchyCounts; isLoading?: boolean };

export const AcademicSetupProgress = ({
  counts,
  isLoading = false,
}: AcademicSetupProgressProps) => {
  const coverage = getHierarchyCoverage(counts);

  return (
    <Paper
      component="section"
      aria-labelledby="hierarchy-progress-title"
      aria-busy={isLoading}
      variant="outlined"
      sx={{ p: 1.25, borderRadius: 2, bgcolor: 'background.paper', flexShrink: 0 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
        <Typography id="hierarchy-progress-title" variant="subtitle2" sx={{ fontWeight: 700 }}>
          Setup progress
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {isLoading
            ? 'Loading hierarchy levels…'
            : `${coverage.completedLevels} of ${HIERARCHY_LEVELS.length} hierarchy levels are in use`}
        </Typography>
      </Box>

      <Box
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}
      >
        <Box
          component="ol"
          aria-label="Hierarchy levels"
          sx={{
            m: 0,
            p: 0,
            listStyle: 'none',
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              sm: 'repeat(5, minmax(0, 1fr))',
            },
            gap: '1px',
            bgcolor: 'divider',
          }}
        >
          {HIERARCHY_LEVELS.map((level) => (
            <AcademicSetupLevel
              key={level.key}
              level={level}
              count={counts[level.key]}
              isLoading={isLoading}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mt: 1, minWidth: 0 }}>
        <Iconify
          icon="solar:lightbulb-bolt-bold-duotone"
          width={18}
          color="warning.main"
          sx={{ flexShrink: 0 }}
          aria-hidden
        />
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, minWidth: 0 }}>
          <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
            Next:{' '}
          </Box>
          {isLoading ? (
            <Skeleton component="span" width={220} sx={{ maxWidth: '100%' }} />
          ) : (
            getHierarchyNextStep(counts)
          )}
        </Typography>
      </Box>
    </Paper>
  );
};
