import type { ReactNode } from 'react';
import type { IColumn } from 'src/components/customizabaleTable/types';

import FilterAltOffRounded from '@mui/icons-material/FilterAltOffRounded';
import { Box, Alert, Paper, Stack, Button, Skeleton, Typography } from '@mui/material';

export const enrollmentWorkspaceRootSx = {
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  height: '100%',
  overflow: { xs: 'auto', md: 'hidden' },
} as const;

export const enrollmentTableWrapperSx = {
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
} as const;

export const enrollmentTableContainerSx = {
  minHeight: { xs: 320, md: 0 },
  height: '100%',
  '& .MuiTableBody-root .MuiTypography-caption': {
    color: 'text.primary',
  },
} as const;

export const enrollmentEmbeddedTableContainerSx = {
  minHeight: 320,
  height: 'auto',
  '& .MuiTableBody-root .MuiTypography-caption': {
    color: 'text.primary',
  },
} as const;

type FilterPanelProps = {
  children: ReactNode;
  onClear?: () => void;
  clearDisabled?: boolean;
  actions?: ReactNode;
  columns?: { xs?: number; sm?: number; md?: number; lg?: number };
};

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export const enrollmentActionsColumn: Pick<
  IColumn,
  'width' | 'minWidth' | 'sticky' | 'stickyPosition' | 'stickyOnMobile' | 'headerSx' | 'cellSx'
> = {
  width: 112,
  minWidth: 104,
  sticky: true,
  stickyPosition: 'right',
  stickyOnMobile: false,
  headerSx: { px: 1.5 },
  cellSx: { px: 1.5 },
};

export function EnrollmentWorkspaceFilterPanel({
  children,
  onClear,
  clearDisabled = false,
  actions,
  columns,
}: FilterPanelProps) {
  const templateColumns = columns
    ? Object.fromEntries(
        Object.entries(columns).map(([breakpoint, count]) => [
          breakpoint,
          `repeat(${count}, minmax(0, 1fr))`,
        ])
      )
    : {
        xs: 'minmax(0, 1fr)',
        sm: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
      };

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Stack spacing={1.25}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: templateColumns,
            gap: 1,
            alignItems: 'center',
            '& > *': { minWidth: 0, width: '100%' },
            '& .MuiFormControl-root': { minWidth: 0, width: '100%' },
            '& .MuiFormControlLabel-root': {
              minHeight: 40,
              m: 0,
              px: 0.5,
            },
          }}
        >
          {children}
        </Box>
        {(onClear || actions) && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            gap={1}
          >
            <Box>{actions}</Box>
            {onClear && (
              <Button
                size="small"
                variant="text"
                startIcon={<FilterAltOffRounded />}
                disabled={clearDisabled}
                onClick={onClear}
                sx={{ alignSelf: { sm: 'flex-end' } }}
              >
                Clear filters
              </Button>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

export function EnrollmentTableEmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Stack spacing={0.5} alignItems="center" sx={{ py: 1 }}>
      <Typography variant="subtitle2" color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {description}
      </Typography>
      {action ? <Box sx={{ pt: 0.5 }}>{action}</Box> : null}
    </Stack>
  );
}

export function EnrollmentWorkspaceErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Alert
      severity="error"
      action={
        <Button size="small" color="inherit" onClick={onRetry}>
          Retry
        </Button>
      }
    >
      {message}
    </Alert>
  );
}

export function EnrollmentWorkspaceLoadingState() {
  return (
    <Stack
      role="status"
      aria-label="Loading Enrollment workspace"
      spacing={1.5}
      sx={enrollmentWorkspaceRootSx}
    >
      <Stack spacing={0.75} sx={{ flexShrink: 0 }}>
        <Skeleton variant="text" width={220} height={34} />
        <Skeleton variant="text" width="min(520px, 80%)" />
      </Stack>
      <Skeleton variant="rounded" height={72} sx={{ flexShrink: 0 }} />
      <Paper
        variant="outlined"
        sx={{ p: 1.5, flex: 1, minHeight: 240, display: 'flex', flexDirection: 'column', gap: 1 }}
      >
        <Skeleton variant="rounded" height={38} width="min(300px, 60%)" />
        <Skeleton variant="rounded" sx={{ flex: 1, minHeight: 160 }} />
        <Skeleton variant="text" width={180} sx={{ alignSelf: 'flex-end' }} />
      </Paper>
    </Stack>
  );
}
