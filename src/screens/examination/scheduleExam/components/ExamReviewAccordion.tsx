import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import {
  Box,
  Stack,
  Button,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

interface ExamReviewAccordionProps {
  title: string;
  description: string;
  icon: string;
  children: ReactNode;
  onEdit?: () => void;
  status?: ReactNode;
  detailsPadding?: number;
}

export function ExamReviewAccordion({
  title,
  description,
  icon,
  children,
  onEdit,
  status,
  detailsPadding = 2,
}: ExamReviewAccordionProps) {
  const hasHeaderActions = Boolean(onEdit || status);

  return (
    <Accordion
      defaultExpanded
      disableGutters
      elevation={0}
      sx={{
        position: 'relative',
        borderRadius: 2,
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        mb: 2,
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<Iconify icon="eva:chevron-down-fill" width={20} />}
        sx={{
          px: 2,
          py: 1,
          pr: hasHeaderActions ? { xs: 18, sm: 24 } : 2,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiAccordionSummary-content': { my: 0.5, alignItems: 'center' },
        }}
      >
        <Box display="flex" alignItems="center" gap={1} minWidth={0}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.25,
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon={icon} width={20} color="text.secondary" />
          </Box>

          <Box minWidth={0}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mt: 0.5, display: { xs: 'none', sm: 'block' } }}
            >
              {description}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      {hasHeaderActions && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ position: 'absolute', top: 10, right: 48, zIndex: 1 }}
        >
          {onEdit && (
            <Button
              size="small"
              variant="outlined"
              aria-label={`Edit ${title}`}
              startIcon={<Iconify icon="eva:edit-2-fill" width={16} />}
              onClick={onEdit}
              sx={{
                minWidth: { xs: 44, sm: 64 },
                height: 44,
                px: { xs: 1, sm: 1.5 },
                fontSize: '0.75rem',
                '& .MuiButton-startIcon': { mx: { xs: 0, sm: undefined } },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Edit
              </Box>
            </Button>
          )}
          {status}
        </Stack>
      )}

      <AccordionDetails sx={{ p: detailsPadding }}>{children}</AccordionDetails>
    </Accordion>
  );
}
