import type { ReactNode } from 'react';

import { useId, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import HelpTooltip from 'src/components/help-tooltip';
import {
  Box,
  Tooltip,
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
  const sectionId = useId();

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      disableGutters
      elevation={0}
      slotProps={{ region: { id: `${sectionId}-content`, 'aria-labelledby': sectionId } }}
      sx={{
        boxShadow: 'none',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        '&.Mui-expanded': { boxShadow: 'none', borderRadius: 2 },
        '&:before': { display: 'none' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: { xs: 1.5, sm: 2.5 },
          py: 0.5,
          bgcolor: 'background.neutral',
          borderRadius: 'inherit',
          ...(expanded && {
            borderBottom: '1px solid',
            borderColor: 'divider',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }),
        }}
      >
        <AccordionSummary
          id={sectionId}
          aria-controls={`${sectionId}-content`}
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
            <Typography variant="subtitle1" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
              {title}
            </Typography>
            {status}
          </Box>
        </AccordionSummary>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          <HelpTooltip
            label={`${title} information`}
            title={`Review the saved ${title.toLowerCase()} before completing the exam setup.`}
          >
            <Iconify icon="lucide:info" width={16} />
          </HelpTooltip>
          {onEdit && (
            <Tooltip title={`Edit ${title}`}>
              <IconButton
                size="small"
                aria-label={`Edit ${title}`}
                onClick={onEdit}
                sx={{ width: 44, height: 44, borderRadius: 1 }}
              >
                <Iconify icon={GlobalIcons.edit} width={18} />
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            size="small"
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title}`}
            aria-expanded={expanded}
            aria-controls={`${sectionId}-content`}
            onClick={() => setExpanded((current) => !current)}
            sx={{ width: 44, height: 44 }}
          >
            <Iconify
              icon="eva:chevron-down-fill"
              width={20}
              sx={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
            />
          </IconButton>
        </Box>
      </Box>

      <AccordionDetails sx={{ p: { xs: 1.5, sm: 2.5 } }}>{children}</AccordionDetails>
    </Accordion>
  );
}
