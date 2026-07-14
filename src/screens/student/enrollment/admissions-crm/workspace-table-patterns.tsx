import type { ReactNode } from 'react';
import type { IColumn } from 'src/components/customizabaleTable/types';

import FilterAltOffRounded from '@mui/icons-material/FilterAltOffRounded';
import { Box, Alert, Paper, Stack, Button, Typography } from '@mui/material';

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
  columns = { xs: 1, sm: 2, lg: 4 },
}: FilterPanelProps) {
  const templateColumns = Object.fromEntries(
    Object.entries(columns).map(([breakpoint, count]) => [
      breakpoint,
      `repeat(${count}, minmax(0, 1fr))`,
    ])
  );

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Stack spacing={1.25}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: templateColumns,
            gap: 1,
            alignItems: 'center',
            '& .MuiFormControl-root': { minWidth: 0 },
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

export function EnrollmentTableEmptyState({ title, description }: EmptyStateProps) {
  return (
    <Stack spacing={0.5} alignItems="center" sx={{ py: 1 }}>
      <Typography variant="subtitle2" color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {description}
      </Typography>
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
