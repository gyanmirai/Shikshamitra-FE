'use client';

import type { FinanceOperatorOption } from 'src/redux/library/charges-management/finance-operator.types';
import type { FinanceExternalReceivable } from 'src/redux/library/charges-management/finance-external.types';
import type { PostFinanceExternalReceivable } from 'src/redux/library/charges-management/finance-external.commands';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useMemo, useState } from 'react';
import { Box, Alert, Stack } from '@mui/material';
import { LoadingButton } from 'src/components/loading-button';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { FinanceOperatorOptionKind } from 'src/redux/library/charges-management/finance-operator.types';
import { usePostFinanceExternalReceivableMutation } from 'src/redux/library/charges-management/finance-external-api';
import { isCollectionOutcomeUncertain } from 'src/screens/finance/FeeCollection/FeeCollectionComponent/feeCollectionContext';

import {
  useFinanceActionBusy,
  FinanceOperatorSelect,
  useFinanceActionDirty,
} from './FinanceOperatorSelect';

import type { FinanceActionProps } from './finance-flow-types';

const schema = Yup.object({
  category: Yup.mixed<FinanceOperatorOption>()
    .nullable()
    .required('Finance charge category is required')
    .test(
      'selectable',
      'Choose an available Finance charge category',
      (value) => !value || value.isSelectable
    ),
});

export function FinancePostingForm({
  source,
  disabled,
  onChanged,
  onBusyChange,
  onDirtyChange,
}: FinanceActionProps) {
  const selectedSource = useMemo(
    () => ({ kind: source.kind, sourceId: source.sourceId, sourceVersion: source.sourceVersion }),
    [source.kind, source.sourceId, source.sourceVersion]
  );
  const [post, mutation] = usePostFinanceExternalReceivableMutation();
  const [error, setError] = useState<string | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const command = useRef<PostFinanceExternalReceivable | null>(null);
  const inFlight = useRef(false);
  const formik = useFormik<{ category: FinanceOperatorOption | null }>({
    initialValues: { category: null },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      if (disabled || mutation.isLoading || inFlight.current) return;
      if (!command.current) {
        if (!values.category?.isSelectable) return;
        command.current = {
          source: { ...selectedSource },
          financeChargeCategoryId: values.category.id,
          idempotencyKey: crypto.randomUUID(),
        };
      }
      inFlight.current = true;
      setError(null);
      let result: FinanceExternalReceivable;
      try {
        result = await post(command.current).unwrap();
      } catch (failure) {
        const unresolved = isCollectionOutcomeUncertain(failure);
        setUncertain(unresolved);
        if (!unresolved) command.current = null;
        setError(
          parseApiProblemDetail(failure).detail || 'Unable to post the assessment to Finance.'
        );
        return;
      } finally {
        inFlight.current = false;
      }
      command.current = null;
      setUncertain(false);
      helpers.resetForm({ values });
      onChanged(result);
    },
  });
  const submitting = formik.isSubmitting || mutation.isLoading;
  const locked = disabled || submitting || uncertain;
  useFinanceActionBusy(submitting || uncertain, onBusyChange);
  useFinanceActionDirty(formik.dirty, onDirtyChange);
  const categoryError =
    (formik.touched.category || formik.submitCount > 0) &&
    typeof formik.errors.category === 'string'
      ? formik.errors.category
      : undefined;

  return (
    <FormSectionCard
      title="Finance Posting"
      descriptionTooltip="Create the Finance obligation for independent review before collection."
    >
      <Stack spacing={2}>
        <FinanceOperatorSelect
          source={selectedSource}
          purpose="posting"
          optionKind={FinanceOperatorOptionKind.chargeCategory}
          label="Finance charge category"
          name="financeChargeCategoryId"
          required
          value={formik.values.category}
          disabled={locked}
          error={Boolean(categoryError)}
          helperText={categoryError}
          onChange={(category) => {
            command.current = null;
            setError(null);
            formik.setFieldValue('category', category);
          }}
          onBlur={() => {
            formik.setFieldTouched('category', true);
          }}
        />
        {error && <Alert severity="error">{error}</Alert>}
        {uncertain && (
          <Alert severity="warning">
            The posting outcome is not confirmed. Retry the previous posting before changing or
            closing this assessment.
          </Alert>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <LoadingButton
            type="button"
            variant="contained"
            size="small"
            loading={submitting}
            disabled={disabled || submitting}
            onClick={() => {
              formik.submitForm();
            }}
          >
            {uncertain ? 'Retry posting to Finance' : 'Post to Finance'}
          </LoadingButton>
        </Box>
      </Stack>
    </FormSectionCard>
  );
}
