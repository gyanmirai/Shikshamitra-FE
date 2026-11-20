'use client';

import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Alert, Stack, Button, TextField } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { useFinanceApprovalForm } from './useFinanceApprovalForm';

import type { FinanceActionProps } from './finance-flow-types';

export function FinanceApprovalForm(props: FinanceActionProps) {
  const { disabled } = props;
  const {
    query,
    context,
    reading,
    available,
    formik,
    error,
    uncertain,
    submitting,
    locked,
    reasonError,
    retry,
    changeReason,
  } = useFinanceApprovalForm(props);

  return (
    <FormSectionCard
      title="Independent Review"
      descriptionTooltip="A different authorized person reviews the original assessment before collection."
    >
      <Stack spacing={2}>
        {query.error && (
          <Alert
            severity="error"
            action={
              <Button
                size="small"
                disabled={submitting || uncertain}
                onClick={() => {
                  retry();
                }}
              >
                Retry
              </Button>
            }
          >
            {parseApiProblemDetail(query.error).detail}
          </Alert>
        )}
        {reading && <Box role="status">Loading approval context…</Box>}
        {context?.issues.map((issue) => (
          <Alert key={issue} severity="info">
            {issue}
          </Alert>
        ))}
        <ShakingTextField error={Boolean(reasonError)}>
          <TextField
            fullWidth
            size="small"
            label="Approval reason"
            name="reason"
            required
            multiline
            minRows={2}
            disabled={locked}
            value={formik.values.reason}
            onChange={changeReason}
            onBlur={formik.handleBlur}
            error={Boolean(reasonError)}
            helperText={reasonError}
            slotProps={{ htmlInput: { maxLength: 1000 } }}
          />
        </ShakingTextField>
        {error && <Alert severity="error">{error}</Alert>}
        {uncertain && (
          <Alert severity="warning">
            The approval outcome is not confirmed. Retry the previous approval before changing or
            closing this assessment.
          </Alert>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <LoadingButton
            type="button"
            variant="contained"
            size="small"
            loading={submitting}
            disabled={disabled || submitting || (!uncertain && !available)}
            onClick={() => {
              formik.submitForm();
            }}
          >
            {uncertain ? 'Retry approval' : 'Approve'}
          </LoadingButton>
        </Box>
      </Stack>
    </FormSectionCard>
  );
}
