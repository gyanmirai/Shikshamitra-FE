'use client';

import type { ReactNode } from 'react';

import { alpha } from '@mui/material/styles';
import Accordion from '@mui/material/Accordion';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

export type DetailSectionAccent = 'primary' | 'success' | 'warning' | 'info' | 'secondary';

type Props = {
  icon: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  accent?: DetailSectionAccent;
  defaultExpanded?: boolean;
};

export function LessonDiaryDetailSection({
  icon,
  title,
  subtitle,
  children,
  accent = 'primary',
  defaultExpanded = true,
}: Props) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: '12px !important',
        bgcolor: 'background.paper',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        overflow: 'hidden',
        '&:before': { display: 'none' },
        '&.Mui-expanded': { m: 0 },
      }}
    >
      <AccordionSummary
        expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={16} />}
        sx={{
          px: 2,
          minHeight: 64,
          '& .MuiAccordionSummary-content': { my: 1.25, mr: 1 },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Box
            sx={(theme) => ({
              width: 36,
              height: 36,
              display: 'grid',
              flexShrink: 0,
              placeItems: 'center',
              borderRadius: 1.25,
              color: theme.palette[accent].main,
              bgcolor: alpha(theme.palette[accent].main, 0.09),
              border: `1px solid ${alpha(theme.palette[accent].main, 0.16)}`,
            })}
          >
            <Iconify icon={icon} width={18} />
          </Box>

          <Stack spacing={0.25}>
            <Typography variant="subtitle2" fontWeight={700}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Stack>
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2, pt: 0.5, pb: 2 }}>
        <Stack spacing={1.5}>{children}</Stack>
      </AccordionDetails>
    </Accordion>
  );
}
