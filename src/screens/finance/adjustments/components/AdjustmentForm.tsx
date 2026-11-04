'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { formatNumber } from 'src/utils/formate_number';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetAdjustmentEligibilityQuery } from 'src/redux/finance/adjustments/adjustmentApi';
import type { IAdjustmentFullFormValues } from '../types/adjustmentFormValues';
import type { IAdjustmentFormProps } from '../types/adjustment.types';
import type { RefundFormik } from '../../feeRefund/NewRefundForm/types';

import AdjustmentGeneralInfoCard from './AdjustmentGeneralInfoCard';
import FeeHeadRefundTable from '../../feeRefund/NewRefundForm/FeeHeadRefundTable';
import {
  buildAdjustmentInitialValues,
  buildAdjustmentValidationSchema,
} from '../types/adjustmentFormValues';

export default function AdjustmentForm({
  onCancel,
  onSubmit,
  onBusyChange,
  hideStudentInfoForm = false,
  initialData,
  defaultBoardId = '',
  defaultMediumId = '',
  defaultStandardId = '',
  defaultDivisionId = '',
}: IAdjustmentFormProps & {
  hideStudentInfoForm?: boolean;
  initialData?: Partial<IAdjustmentFullFormValues>;
}) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [initialValues] = useState(() =>
    buildAdjustmentInitialValues({
      boardId: defaultBoardId,
      mediumId: defaultMediumId,
      standardId: defaultStandardId,
      divisionId: defaultDivisionId,
      ...initialData,
    })
  );
  const previousYear = useRef(currentYear?.id);
  const formik = useFormik<IAdjustmentFullFormValues>({
    initialValues,
    validationSchema: buildAdjustmentValidationSchema(hideStudentInfoForm),
    onSubmit: async (values, helpers) => {
      if (!canSubmitAdjustment) return;
      try {
        await onSubmit(values);
        helpers.resetForm();
        onCancel(null, true);
      } catch (error) {
        shikshaMitraToast.error({
          message: parseApiProblemDetail(error).detail || 'Failed to submit adjustment request.',
        });
      }
    },
  });
  const eligibility = useGetAdjustmentEligibilityQuery(
    { studentId: String(formik.values.studentId), academicYearId: currentYear?.id ?? '' },
    { skip: !formik.values.studentId || !currentYear?.id }
  );
  const selectedMonths = useMemo(
    () => formik.values.feeHeadRefunds.flatMap((head) => head.months),
    [formik.values.feeHeadRefunds]
  );
  const totalAmount = selectedMonths.reduce((sum, month) => sum + (Number(month.amount) || 0), 0);
  const canSubmitAdjustment = Boolean(
    eligibility.currentData &&
    !eligibility.isFetching &&
    !eligibility.isError &&
    eligibility.currentData.totalAdjustable > 0 &&
    eligibility.currentData.feeHeads.some((head) =>
      head.months.some((month) => month.adjustable > 0)
    ) &&
    selectedMonths.length > 0 &&
    selectedMonths.every(
      (month) =>
        month.dueFeeId && /^\d+(\.\d{1,2})?$/.test(String(month.amount)) && Number(month.amount) > 0
    )
  );
  const showRemarksError = Boolean(
    (formik.touched.remarks || formik.submitCount > 0) && formik.errors.remarks
  );
  const { resetForm } = formik;

  useEffect(() => {
    onBusyChange?.(formik.isSubmitting);
    return () => onBusyChange?.(false);
  }, [formik.isSubmitting, onBusyChange]);
  useEffect(() => {
    if (previousYear.current !== currentYear?.id) {
      previousYear.current = currentYear?.id;
      resetForm({ values: buildAdjustmentInitialValues() });
    }
  }, [currentYear?.id, resetForm]);

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
    >
      <Scrollbar fillContent sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ p: 2, minWidth: 0 }}>
          <FormBusyRegion busy={formik.isSubmitting} label="Submitting adjustment…">
            <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
              <Stack spacing={2}>
                {!hideStudentInfoForm && (
                  <FormSectionCard
                    title="Student Information"
                    icon={GlobalIcons.assigned}
                    descriptionTooltip="Choose the student's board, medium, class and division for the current academic year, then select the student."
                  >
                    <AdjustmentGeneralInfoCard formik={formik} />
                  </FormSectionCard>
                )}
                <FormSectionCard
                  title="Adjustment Information"
                  icon={GlobalIcons.notebook}
                  descriptionTooltip="Record the reason for moving the selected fee balance to other eligible outstanding fees. This request does not make a cash payout."
                >
                  <ShakingTextField error={showRemarksError}>
                    <TextField
                      required
                      fullWidth
                      size="small"
                      multiline
                      minRows={3}
                      name="remarks"
                      label="Remarks"
                      value={formik.values.remarks}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={showRemarksError}
                      helperText={showRemarksError ? formik.errors.remarks : undefined}
                    />
                  </ShakingTextField>
                </FormSectionCard>
                <FormSectionCard
                  title="Source Fee Lines"
                  icon={GlobalIcons.receiptIcon}
                  descriptionTooltip="Select eligible fee installments and enter the amount requested from each source. Availability is checked for the selected student and academic year."
                >
                  {/* The shared selector supports adjustment mode using this common form-value subset. */}
                  <FeeHeadRefundTable
                    compact
                    mode="adjustment"
                    formik={formik as unknown as RefundFormik}
                    showError={Boolean(
                      (formik.touched.feeHeadRefunds || formik.submitCount > 0) &&
                      typeof formik.errors.feeHeadRefunds === 'string'
                    )}
                    errorMessage={
                      typeof formik.errors.feeHeadRefunds === 'string'
                        ? formik.errors.feeHeadRefunds
                        : undefined
                    }
                  />
                </FormSectionCard>
              </Stack>
            </BackPopUpChecked>
          </FormBusyRegion>
        </Box>
      </Scrollbar>
      <DialogActions
        sx={{
          px: 2,
          py: 1.5,
          borderTop: 1,
          borderColor: 'divider',
          flexShrink: 0,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto' }}>
          {selectedMonths.length
            ? `${selectedMonths.length} installment${selectedMonths.length === 1 ? '' : 's'} selected · ${formatNumber(totalAmount, 'INR', { fractionDigits: 2 })}`
            : 'No installments selected'}
        </Typography>
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          size="small"
          disabled={formik.isSubmitting}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={(event) => onCancel(event, false)}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          size="small"
          loading={formik.isSubmitting}
          disabled={!canSubmitAdjustment}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Box>
  );
}
