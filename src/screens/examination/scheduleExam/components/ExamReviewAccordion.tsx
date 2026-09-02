import type { ReactNode } from 'react';

import { varAlpha } from 'src/theme/styles';
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
        boxShadow: (theme) =>
          theme.customShadows?.card ||
          '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
        border: (theme) => `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
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
          bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.04),
          borderBottom: (theme) => `1px dashed ${varAlpha(theme.palette.grey['500Channel'], 0.2)}`,
          '& .MuiAccordionSummary-content': { my: 0.5, alignItems: 'center' },
        }}
      >
        <Box display="flex" alignItems="center" gap={1} minWidth={0}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'common.white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: (theme) =>
                `0 4px 8px ${varAlpha(theme.palette.primary.mainChannel, 0.16)}`,
              border: (theme) => `1px solid ${varAlpha(theme.palette.primary.mainChannel, 0.1)}`,
              flexShrink: 0,
            }}
          >
            <Iconify icon={icon} width={24} color="primary.main" />
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
