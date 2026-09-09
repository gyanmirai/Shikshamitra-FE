import { Iconify } from 'src/components/iconify';
import { Box, Skeleton, Typography } from '@mui/material';

import type { HierarchyLevel } from './academic-setup-progress-model';

type Props = { level: HierarchyLevel; count: number; isLoading: boolean };

export const AcademicSetupLevel = ({ level, count, isLoading }: Props) => (
  <Box
    component="li"
    data-testid={`hierarchy-level-${level.key}`}
    sx={{
      minWidth: 0,
      minHeight: 44,
      px: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      bgcolor: 'background.paper',
      '&:last-child': { gridColumn: { xs: '1 / -1', sm: 'auto' } },
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
        bgcolor: count > 0 ? 'primary.lighter' : 'action.hover',
        color: count > 0 ? 'primary.main' : 'text.secondary',
      }}
    >
      <Iconify icon={level.icon} width={17} aria-hidden />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      {isLoading ? (
        <Skeleton width={24} aria-label={`Loading ${level.label.toLowerCase()} count`} />
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
