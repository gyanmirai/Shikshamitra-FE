'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import { formatCurrency } from 'src/utils/cureencyFormater';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Button,
  Divider,
  TextField,
  Typography,
} from '@mui/material';

import AdjustmentGeneralInfoCard from './AdjustmentGeneralInfoCard';
import { ADJUSTMENT_TYPE_OPTIONS } from '../constants/adjustmentOptions';
import FeeHeadRefundTable from '../../feeRefund/NewRefundForm/FeeHeadRefundTable';
import {
  buildAdjustmentInitialValues,
  buildAdjustmentValidationSchema,
} from '../types/adjustmentFormValues';

import type { IAdjustmentFormProps } from '../types/adjustment.types';
import type { IAdjustmentFullFormValues } from '../types/adjustmentFormValues';

const AdjustmentForm: React.FC<
  IAdjustmentFormProps & { hideStudentInfoForm?: boolean; initialData?: any }
> = ({ onCancel, onSubmit, hideStudentInfoForm = false, initialData }) => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [hasFeePaymentRecords, setHasFeePaymentRecords] = useState(true);

  const formik = useFormik<IAdjustmentFullFormValues>({
    initialValues: {
      ...buildAdjustmentInitialValues(),
      ...initialData, // Pre-fill form with student fee structure details
    },
    validationSchema: buildAdjustmentValidationSchema(),
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, helpers) => {
      try {
        onSubmit(values as any);
        helpers.resetForm();
        onCancel?.(new MouseEvent('click') as any, true);
      } catch {
        shikshaMitraToast.error({ message: 'Failed to submit adjustment request.' });
      }
    },
  });

  const { values, touched, errors, handleChange, handleBlur, setFieldValue } = formik;

  // ── Derived totals for sticky footer ────────────────────────────────────────
  const { totalSelectedMonths, totalAdjustmentAmount } = useMemo(() => {
    let months = 0;
    let total = 0;
    (values.feeHeadRefunds || []).forEach((fh) => {
      fh.months.forEach((m) => {
        months += 1;
        total += Number(m.amount) || 0;
      });
    });
    return { totalSelectedMonths: months, totalAdjustmentAmount: total };
  }, [values.feeHeadRefunds]);
  useEffect(() => {
    formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear?.id]);
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      display="flex"
      flexDirection="column"
      height="100%"
    >
      {/* ── Scrollable content ── */}
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ p: { xs: 1, md: 2 }, pb: 1 }}>
          <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
            {!hideStudentInfoForm && (
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  mb: 1.5,
                  borderRadius: 2,
                  transition: 'box-shadow 0.2s ease',
                  '&:hover': { boxShadow: 4 },
                }}
              >
                <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                  <Iconify
                    icon="solar:users-group-rounded-bold-duotone"
                    width={18}
                    sx={{ color: 'primary.main' }}
                  />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Student Information
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Select board, class, and student to proceed
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <AdjustmentGeneralInfoCard formik={formik} />
              </Paper>
            )}

            {/* ── Fee Head-wise Details (same as refund) ── */}
            <FeeHeadRefundTable
              formik={formik as any}
              mode="adjustment"
              onHasRecords={setHasFeePaymentRecords}
              showError={
                !!(formik.touched.feeHeadRefunds && formik.errors.feeHeadRefunds) &&
                typeof formik.errors.feeHeadRefunds === 'string'
              }
              errorMessage={
                typeof formik.errors.feeHeadRefunds === 'string'
                  ? (formik.errors.feeHeadRefunds as string)
                  : undefined
              }
            />

            {/* ── Adjustment Details ── */}
            {hasFeePaymentRecords && (
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  mb: 1.5,
                  borderRadius: 2,
                  transition: 'box-shadow 0.2s ease',
                  '&:hover': { boxShadow: 4 },
                }}
              >
                <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                  <Iconify icon="mdi:tune-variant" width={18} sx={{ color: 'warning.main' }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Adjustment Details
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Specify the type, amount, and reason for this adjustment
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ShakingTextField error={!!(touched.adjustmentType && errors.adjustmentType)}>
                      <CustomSelect
                        label="Adjustment Type *"
                        options={ADJUSTMENT_TYPE_OPTIONS}
                        labelKey="label"
                        valueKey="value"
                        value={values.adjustmentType}
                        onChange={(val) => setFieldValue('adjustmentType', val)}
                        error={!!errors.adjustmentType && touched.adjustmentType}
                        helperText={(touched.adjustmentType && errors.adjustmentType) as string}
                        formControlProps={{ fullWidth: true }}
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <ShakingTextField error={!!(touched.reason && errors.reason)}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Reason *"
                        name="reason"
                        placeholder="Provide a clear reason for the adjustment..."
                        value={values.reason}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!(touched.reason && errors.reason)}
                        helperText={(touched.reason && errors.reason) as string}
                      />
                    </ShakingTextField>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </BackPopUpChecked>
        </Box>
      </Scrollbar>

      {/* ── Sticky Finance Action Bar ── */}
      <Box
        sx={{
          flexShrink: 0,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.paper, 0.92),
          backdropFilter: 'blur(12px)',
          px: { xs: 2, md: 3 },
          py: 1.5,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1.5}
        >
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            {totalSelectedMonths > 0 ? (
              <>
                <Chip
                  size="small"
                  label={`${totalSelectedMonths} month${totalSelectedMonths !== 1 ? 's' : ''} selected`}
                  color="warning"
                  variant="soft"
                  icon={<Iconify icon="solar:calendar-bold" width={14} />}
                />
                {totalAdjustmentAmount > 0 && (
                  <Box display="flex" alignItems="center" gap={0.75}>
                    <Typography variant="caption" color="text.secondary">
                      Adjustment Amount:
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={800} color="warning.main">
                      {formatCurrency(totalAdjustmentAmount)}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                No months selected yet
              </Typography>
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={1.5}>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: 'none', sm: 'block' } }}
            />
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={(e) => onCancel?.(e, false)}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              size="small"
              startIcon={<Iconify icon="mdi:tune-variant" />}
              onClick={() => formik.handleSubmit()}
            >
              Submit
            </LoadingButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdjustmentForm;
