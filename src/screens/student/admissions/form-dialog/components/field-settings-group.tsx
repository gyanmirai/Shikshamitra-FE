import type { ReactNode } from 'react';

import { useId } from 'react';
import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { useBoolean } from 'src/hooks/use-boolean';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

type Props = {
  title: string;
  description: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  forceExpanded?: boolean;
};

export function FieldSettingsGroup({
  title,
  description,
  children,
  defaultExpanded = false,
  forceExpanded = false,
}: Props) {
  const id = useId();
  const expanded = useBoolean(defaultExpanded);
  return (
    <Accordion
      disableGutters
      elevation={0}
      expanded={forceExpanded || expanded.value}
      onChange={(_, isExpanded) => expanded.setValue(isExpanded)}
      sx={{ border: 1, borderColor: 'divider', borderRadius: 1, '&::before': { display: 'none' } }}
    >
      <AccordionSummary
        id={`${id}-header`}
        aria-controls={`${id}-content`}
        expandIcon={<Iconify icon="mdi:chevron-down" />}
        sx={{ px: 1.5, minHeight: 56 }}
      >
        <Box>
          <Typography variant="subtitle2">{title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 1.5, pt: 0.5 }}>{children}</AccordionDetails>
    </Accordion>
  );
}
