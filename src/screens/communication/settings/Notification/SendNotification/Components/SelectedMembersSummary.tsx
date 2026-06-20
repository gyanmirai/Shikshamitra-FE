'use client';

import type { FormikProps } from 'formik';

import React, { memo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { INotificationSendSchema } from './type';

interface SelectedMembersSummaryProps {
  formik: FormikProps<INotificationSendSchema>;
}

/**
 * Component: SelectedMembersSummary
 * Responsibilities:
 * - Rendering a list of chips for selected members
 * - Handling display when many members are selected (slice + count)
 */
const SelectedMembersSummary = ({ formik }: SelectedMembersSummaryProps) => {
  const selectedMembers = formik.values.members
    .filter((member: any) => member.isSelect)
    .map((member: any) => member.name);

  const count = selectedMembers.length;

  return (
    <SectionCard title="Selected Members">
      <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
        {count > 0 ? (
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {selectedMembers.slice(0, 5).map((name: string) => (
              <Chip key={name} label={name} size="small" variant="outlined" />
            ))}
            {count > 5 && (
              <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>
                +{count - 5} more...
              </Typography>
            )}
          </Box>
        ) : (
          'Please select members to send notifications'
        )}
      </Box>
    </SectionCard>
  );
};

/**
 * Memoization Justification:
 * Pure component that derives its display from Formik members.
 * Prevents re-renders unless the member selection changes.
 */
export default memo(SelectedMembersSummary);
