import type { ReactNode } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import { Box, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

/** Read-only counterpart of the shared form section, matching the policy detail view. */
export function DetailSection({
  title,
  icon,
  helpText,
  action,
  children,
  sx,
}: {
  title: string;
  icon: string;
  helpText?: string;
  action?: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <FormSectionCard
      title={title}
      icon={icon}
      iconSize={16}
      iconContainerSize={28}
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
      descriptionTooltip={helpText}
      action={action}
      sx={[
        {
          minWidth: 0,
          boxShadow: 'none',
          bgcolor: 'background.paper',
          containerType: 'inline-size',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </FormSectionCard>
  );
}

/** Columns respond to the actual section width, including in narrow dialogs and drawers. */
export function DetailGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: 2,
        '@container (min-width: 440px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
        '@container (min-width: 680px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
      }}
    >
      {children}
    </Box>
  );
}

export function DetailField({
  label,
  value,
  secondary,
  fullWidth = false,
}: {
  label: string;
  value?: ReactNode;
  secondary?: string;
  fullWidth?: boolean;
}) {
  return (
    <Box sx={{ minWidth: 0, ...(fullWidth && { gridColumn: '1 / -1' }) }}>
      <Typography
        variant="caption"
        component="div"
        color="text.primary"
        sx={{
          mb: 0.5,
          fontWeight: 800,
          letterSpacing: '0.75px',
          lineHeight: 1.4,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        color="text.primary"
        component="div"
        sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
      >
        {value === null || value === undefined || value === '' ? '—' : value}
      </Typography>
      {secondary && (
        <Typography variant="caption" color="text.secondary" component="div">
          {secondary}
        </Typography>
      )}
    </Box>
  );
}
