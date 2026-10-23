import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import HelpTooltip from 'src/components/help-tooltip';
import {
  Box,
  Stack,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

type Props = {
  icon: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultExpanded?: boolean;
};

export function AuditDetailSection({
  icon,
  title,
  subtitle,
  children,
  defaultExpanded = true,
}: Props) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: '12px !important',
        '&:before': { display: 'none' },
      }}
    >
      <Stack direction="row" alignItems="center" sx={{ px: 2 }}>
        <AccordionSummary
          expandIcon={<Iconify icon="mdi:chevron-down" width={18} />}
          sx={{ flex: 1, px: 0 }}
        >
          <Stack direction="row" gap={1} alignItems="center">
            <Iconify icon={icon} width={20} sx={{ color: 'text.secondary' }} />
            <Typography component="h2" variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
          </Stack>
        </AccordionSummary>
        <Box>
          <HelpTooltip
            label={`${title} information`}
            title={subtitle || `Review the recorded ${title.toLowerCase()} for this audit event.`}
          >
            <Iconify icon="lucide:info" width={16} />
          </HelpTooltip>
        </Box>
      </Stack>
      <AccordionDetails sx={{ px: 2, pt: 0.5, pb: 2 }}>{children}</AccordionDetails>
    </Accordion>
  );
}
