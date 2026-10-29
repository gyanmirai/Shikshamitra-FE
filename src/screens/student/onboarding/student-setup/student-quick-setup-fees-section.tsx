'use client';

import type { ReactNode } from 'react';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useId, useState, useEffect } from 'react';
import CustomAccordion from 'src/components/custom-accordian';
import { FormSectionHeader } from 'src/components/form-section-card';
import { Box, Stack, Tooltip, Skeleton, IconButton, Typography } from '@mui/material';

import type { StudentOnboardingFeesState } from './student-onboarding-fees';

export default function StudentQuickSetupFeesSection({
  caseId,
  state,
  disabled,
  initiallyExpanded = false,
  children,
}: {
  caseId: string;
  state: StudentOnboardingFeesState;
  disabled: boolean;
  initiallyExpanded?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  const [opened, setOpened] = useState(initiallyExpanded);
  useEffect(() => setOpened(initiallyExpanded), [caseId, initiallyExpanded]);
  useEffect(() => {
    if (state.hasError || (!state.loading && (!state.confirmed || state.dirty))) setOpened(true);
  }, [caseId, state.loading, state.confirmed, state.dirty, state.hasError]);
  const expanded = opened;

  return (
    <Box
      component="section"
      aria-label="Fees"
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <CustomAccordion
        title="Fees"
        expanded={expanded}
        onChange={() => {
          if (!disabled) setOpened((value) => !value);
        }}
        summary={
          <Box
            id={`${id}-summary`}
            sx={{
              p: { xs: 1.5, sm: 2 },
              color: 'text.primary',
              overflowWrap: 'anywhere',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ flexShrink: 0 }}>
              <FormSectionHeader
                title="Fees"
                icon="mdi:receipt-text-outline"
                descriptionTooltip="Fee assignment and payment are optional for activation. Review fees and receipts here."
              />
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                order: { xs: 3, sm: 0 },
                width: { xs: '100%', sm: 'auto' },
                flexBasis: { xs: '100%', sm: 0 },
              }}
            >
              {state.loading && !state.hasError ? (
                <Skeleton width="80%" sx={{ maxWidth: 240 }} />
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {state.structureName}
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 'auto' }}>
              {!state.loading && !state.hasError && (
                <Label color={state.confirmed ? 'success' : 'warning'}>
                  {state.confirmed ? 'Confirmed' : 'Fees pending'}
                </Label>
              )}
              <Tooltip title={expanded ? 'Collapse fees' : 'Expand fees'}>
                <span>
                  <IconButton
                    size="small"
                    aria-label={expanded ? 'Collapse fees' : 'Expand fees'}
                    aria-expanded={expanded}
                    aria-controls={`${id}-content`}
                    disabled={disabled}
                    onClick={() => setOpened((value) => !value)}
                  >
                    <Iconify icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Box>
        }
        content={
          <Box id={`${id}-content`} sx={{ px: 0.5, pb: 0.5 }}>
            {children}
          </Box>
        }
      />
    </Box>
  );
}
