'use client';

import type { ReactNode } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import { useId } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button, Typography } from '@mui/material';

export type FormPrerequisiteAction = { label: string; href: string };

export interface FormPrerequisiteStateProps {
  title: string;
  description: ReactNode;
  actions: FormPrerequisiteAction[];
  onRefresh?: () => void;
  compact?: boolean;
  sx?: SxProps<Theme>;
}

/** Body-only state: the owning form retains its header, footer and unsaved values. */
export function FormPrerequisiteState({
  title,
  description,
  actions,
  onRefresh,
  compact = false,
  sx,
}: FormPrerequisiteStateProps) {
  const titleId = useId();
  return (
    <Stack
      role="region"
      aria-labelledby={titleId}
      aria-live="polite"
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={[
        {
          flex: 1,
          minWidth: 0,
          width: 1,
          px: { xs: 2, sm: 3 },
          py: compact ? 3 : { xs: 4, sm: 6 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          display: 'flex',
          p: 1.5,
          borderRadius: '50%',
          bgcolor: 'background.neutral',
          color: 'text.secondary',
        }}
      >
        <Iconify icon={GlobalIcons.notebook} width={24} aria-hidden="true" />
      </Box>
      <Stack spacing={1} sx={{ textAlign: 'center', maxWidth: 440 }}>
        <Typography id={titleId} component="h3" variant="subtitle1">
          {title}
        </Typography>
        <Typography
          component="div"
          variant="body2"
          color="text.secondary"
          sx={{ overflowWrap: 'anywhere' }}
        >
          {description}
        </Typography>
        {actions.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Ask your administrator to complete this setup.
          </Typography>
        )}
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        justifyContent="center"
        sx={{ maxWidth: 1 }}
      >
        {actions.map((action) => (
          <Button
            key={`${action.href}:${action.label}`}
            component="a"
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            color="inherit"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.addIcon} />}
            sx={{ whiteSpace: 'normal', textAlign: 'center' }}
          >
            {action.label}
          </Button>
        ))}
        {onRefresh && (
          <Button
            type="button"
            size="small"
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.refresh} />}
            onClick={onRefresh}
          >
            Refresh options
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
