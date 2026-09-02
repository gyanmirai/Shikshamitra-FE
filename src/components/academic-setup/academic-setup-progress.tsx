import { Iconify } from 'src/components/iconify';
import { Box, Paper, Skeleton, Typography, LinearProgress } from '@mui/material';

import {
  HIERARCHY_LEVELS,
  getHierarchyCoverage,
  getHierarchyNextStep,
} from './academic-setup-progress-model';

import type { HierarchyCounts } from './academic-setup-model';

type AcademicSetupProgressProps = {
  counts: HierarchyCounts;
  isLoading?: boolean;
};

export const AcademicSetupProgress = ({
  counts,
  isLoading = false,
}: AcademicSetupProgressProps) => {
  const coverage = getHierarchyCoverage(counts);

  return (
    <Paper
      component="section"
      aria-labelledby="hierarchy-progress-title"
      variant="outlined"
      sx={{ p: 1.25, borderRadius: 2, bgcolor: 'background.paper' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 0.75,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 0.75 }}>
          <Typography id="hierarchy-progress-title" variant="subtitle2" sx={{ fontWeight: 700 }}>
            Setup progress
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {coverage.completedLevels} of {HIERARCHY_LEVELS.length} hierarchy levels are in use
          </Typography>
        </Box>
        <Box sx={{ width: { xs: 96, sm: 160 }, flexShrink: 0 }}>
          <LinearProgress
            aria-label={`Academic hierarchy coverage: ${coverage.percentage}%`}
            variant="determinate"
            value={coverage.percentage}
            sx={{ height: 5, borderRadius: 1 }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'stretch', lg: 'center' },
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 1,
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(88px, 1fr))',
            overflowX: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
            bgcolor: 'background.paper',
          }}
        >
          {HIERARCHY_LEVELS.map((level, index) => {
            const count = counts[level.key];
            const isInUse = count > 0;

            return (
              <Box
                key={level.key}
                data-testid={`hierarchy-level-${level.key}`}
                sx={{
                  minWidth: 0,
                  minHeight: 42,
                  px: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  borderRight: index < HIERARCHY_LEVELS.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: isInUse ? 'primary.lighter' : 'action.hover',
                    color: isInUse ? 'primary.main' : 'text.secondary',
                  }}
                >
                  <Iconify icon={level.icon} width={17} aria-hidden />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  {isLoading ? (
                    <Skeleton
                      width={24}
                      aria-label={`Loading ${level.label.toLowerCase()} count`}
                    />
                  ) : (
                    <Typography variant="subtitle2" sx={{ lineHeight: 1.1 }}>
                      {count}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {level.label}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: '0 1 420px' }}
        >
          <Iconify
            icon="solar:lightbulb-bolt-bold-duotone"
            width={18}
            color="warning.main"
            aria-hidden
          />
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
            <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
              Next:{' '}
            </Box>
            {isLoading ? <Skeleton component="span" width={220} /> : getHierarchyNextStep(counts)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
