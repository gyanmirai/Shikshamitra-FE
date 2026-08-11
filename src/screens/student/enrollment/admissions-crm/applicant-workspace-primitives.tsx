'use client';

import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import { Box, Paper, Stack, Switch, Typography } from '@mui/material';

type SectionProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function ApplicantSection({ title, description, action, children }: SectionProps) {
  return (
    <Paper component="section" variant="outlined" sx={{ p: { xs: 1.25, sm: 1.5 } }}>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        gap={2}
        mb={1.25}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" component="h3">
            {title}
          </Typography>
          {description ? (
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          ) : null}
        </Box>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

export function ApplicantSummaryGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
        columnGap: 3,
        rowGap: 1.25,
      }}
    >
      {children}
    </Box>
  );
}

export function ApplicantSummaryItem({
  label,
  value,
  secondary,
}: {
  label: string;
  value: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" component="div">
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={600}
        component="div"
        sx={{ overflowWrap: 'anywhere' }}
      >
        {value || 'Not captured'}
      </Typography>
      {secondary ? (
        <Typography variant="caption" color="text.secondary" component="div">
          {secondary}
        </Typography>
      ) : null}
    </Box>
  );
}

export function ApplicantActionPanel({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        borderTop: 1,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'action.hover',
        px: { xs: 1.25, sm: 1.5 },
        py: 1.5,
      }}
    >
      {children}
    </Box>
  );
}

export function ApplicantInlineNotice({
  children,
  icon = 'solar:info-circle-linear',
  tone = 'neutral',
}: {
  children: ReactNode;
  icon?: string;
  tone?: 'neutral' | 'warning' | 'error' | 'success';
}) {
  const color =
    tone === 'warning'
      ? 'warning.main'
      : tone === 'error'
        ? 'error.main'
        : tone === 'success'
          ? 'success.main'
          : 'text.secondary';

  return (
    <Stack
      direction="row"
      gap={1}
      alignItems="flex-start"
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Iconify icon={icon} width={18} sx={{ color, mt: '2px' }} />
      <Typography variant="body2" color={tone === 'neutral' ? 'text.secondary' : 'text.primary'}>
        {children}
      </Typography>
    </Stack>
  );
}

export function ApplicantEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Stack alignItems="flex-start" gap={0.75} py={1}>
      <Typography variant="body2" fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
      {action}
    </Stack>
  );
}

export function ApplicantSwitchRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      gap={2}
      sx={{ minHeight: 44 }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={500}>
          {label}
        </Typography>
        {description ? (
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Box>
      <Switch
        size="small"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        inputProps={{ 'aria-label': label }}
      />
    </Stack>
  );
}
