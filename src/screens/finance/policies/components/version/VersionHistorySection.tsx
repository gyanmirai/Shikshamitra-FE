'use client';

import type { ReactNode } from 'react';

import { useId, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CustomAccordion from 'src/components/custom-accordian';
import { Stack, Paper, Typography, IconButton, AccordionSummary } from '@mui/material';

interface Props {
  title: string;
  helpText: string;
  helpLabel?: string;
  badge?: ReactNode;
  children: ReactNode;
  expanded?: boolean;
  onChange?: () => void;
  defaultExpanded?: boolean;
}

export default function VersionHistorySection({
  title,
  helpText,
  helpLabel = `${title} information`,
  badge,
  children,
  expanded,
  onChange,
  defaultExpanded = false,
}: Props) {
  const id = useId();
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = expanded ?? internalExpanded;

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        '& > .MuiAccordion-root': { m: 0, borderRadius: 0 },
        '& .MuiAccordionDetails-root': { p: { xs: 1.5, sm: 2 }, color: 'text.primary' },
      }}
    >
      <CustomAccordion
        title={title}
        expanded={isExpanded}
        onChange={onChange ?? (() => setInternalExpanded((value) => !value))}
        summary={
          <Stack
            id={`${id}-header`}
            aria-controls={`${id}-content`}
            direction="row"
            alignItems="center"
            sx={{ px: { xs: 1.5, sm: 2 } }}
          >
            <AccordionSummary
              id={`${id}-toggle`}
              aria-controls={`${id}-content`}
              aria-label={title}
              expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
              sx={{
                flex: 1,
                minWidth: 0,
                p: 0,
                '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1 },
              }}
            >
              <Typography variant="subtitle1" component="h3" color="text.primary">
                {title}
              </Typography>
              {badge}
            </AccordionSummary>
            <CustomTooltip placement="right" arrow title={helpText}>
              <IconButton size="small" aria-label={helpLabel}>
                <Iconify
                  icon={GlobalIcons.info}
                  width={16}
                  sx={{ color: 'info.main' }}
                  aria-hidden
                />
              </IconButton>
            </CustomTooltip>
          </Stack>
        }
        content={isExpanded ? children : null}
      />
    </Paper>
  );
}
