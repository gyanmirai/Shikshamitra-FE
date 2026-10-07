import type { ReactNode } from 'react';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Accordion,
  IconButton,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

interface ExamReviewAccordionProps {
  title: string;
  icon: string;
  children: ReactNode;
  onEdit?: () => void;
  status?: ReactNode;
}

export function ExamReviewAccordion({
  title,
  icon,
  children,
  onEdit,
  status,
}: ExamReviewAccordionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      disableGutters
      elevation={0}
      sx={{
        boxShadow: 'none',
        bgcolor: 'transparent',
        mb: 3,
        '&:before': { display: 'none' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <AccordionSummary
          sx={{
            flex: 1,
            minWidth: 0,
            px: 0,
            py: 0,
            '& .MuiAccordionSummary-content': { my: 0.5, minWidth: 0 },
          }}
        >
          <Box
            sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, minWidth: 0 }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: 'action.hover',
                color: 'text.secondary',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon={icon} width={18} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {title}
            </Typography>
            {status}
          </Box>
        </AccordionSummary>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          {onEdit && (
            <IconButton
              size="small"
              aria-label={`Edit ${title}`}
              onClick={onEdit}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
            >
              <Iconify icon="solar:pen-bold" width={18} />
            </IconButton>
          )}
          <IconButton
            size="small"
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title}`}
            aria-expanded={expanded}
            onClick={() => setExpanded((current) => !current)}
          >
            <Iconify
              icon="eva:chevron-down-fill"
              width={20}
              sx={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
            />
          </IconButton>
        </Box>
      </Box>

      <AccordionDetails sx={{ px: 0, pt: 1.5, pb: 0 }}>{children}</AccordionDetails>
    </Accordion>
  );
}
