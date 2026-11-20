'use client';

import { Box, Alert, Stack, Button } from '@mui/material';
import { LoadingButton } from 'src/components/loading-button';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { FinanceBindingFields } from './FinanceBindingFields';
import { useFinanceBindingForm } from './useFinanceBindingForm';

import type { FinanceActionProps } from './finance-flow-types';

export function FinanceBindingForm(props: FinanceActionProps) {
  const { disabled } = props;
  const form = useFinanceBindingForm(props);
  const { query, context, reading, available, formik, error, uncertain, submitting, retry } = form;

  return (
    <FormSectionCard
      title="Settlement Policy"
      descriptionTooltip="Select the recorded collection policy and an optional refund policy. Finance retains this confirmed selection."
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
        {reading && <Box role="status">Loading settlement policy context…</Box>}
        {context?.issues.map((issue) => (
          <Alert key={issue} severity="info">
            {issue}
          </Alert>
        ))}
        <FinanceBindingFields form={form} />
        {error && <Alert severity="error">{error}</Alert>}
        {uncertain && (
          <Alert severity="warning">
            The policy confirmation outcome is not confirmed. Retry the previous confirmation before
            changing or closing this assessment.
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
            {uncertain ? 'Retry policy confirmation' : 'Confirm policy'}
          </LoadingButton>
        </Box>
      </Stack>
    </FormSectionCard>
  );
}
