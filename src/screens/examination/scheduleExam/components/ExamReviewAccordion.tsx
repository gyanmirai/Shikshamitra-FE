import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import {
  Box,
  Button,
  Accordion,
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
  return (
    <Accordion
      defaultExpanded
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
          expandIcon={<Iconify icon="eva:chevron-down-fill" width={20} />}
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
        {onEdit && (
          <Button
            size="small"
            variant="outlined"
            aria-label={`Edit ${title}`}
            onClick={onEdit}
            sx={{ flexShrink: 0, minWidth: 56 }}
          >
            Edit
          </Button>
        )}
      </Box>

      <AccordionDetails sx={{ px: 0, pt: 1.5, pb: 0 }}>{children}</AccordionDetails>
    </Accordion>
  );
}
