import type { FormikErrors } from 'formik';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Chip,
  Grid,
  Button,
  Divider,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { getInitialPaymentTermData } from './PaymentTermInitialValues';
import { paymentTermValidationSchema } from './PayementTermValidationSchema';

import type { IInstallment, IFeeStructureFormProps } from '../type';

const PaymentTermForm: React.FC<IFeeStructureFormProps> = ({ open, onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Initialize formik form handling with validation and submission logic
  const formik = useFormik({
    // Set initial form values, populated from editData if available
    initialValues: getInitialPaymentTermData(editData),
    validationSchema: paymentTermValidationSchema(currentYear),
    validateOnChange: true,
    // Handle form submission
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `Payment Term ${values.paymentTermName} updated successfully`,
        });
      } else {
        shikshaMitraToast.success({
          message: `Payment Term ${values.paymentTermName} added successfully`,
        });
      }
      onClose(null, true);
    },
  });

  const [installments, setInstallments] = useState(formik.values.installments || []);

  // Update installments when number changes
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      const count = Number(formik.values.totalInstallments || 0);

      // Run full validation to get the latest errors
      const errors = await formik.validateForm();
      const hasError = Boolean(errors.totalInstallments);

      if (count > 0 && !hasError) {
        const updated = Array.from({ length: count }, (_, i) => ({
          index: i,
          id: i + 1,
          installmentName: formik.values.installments?.[i]?.installmentName || '',
          dueDate: formik.values.installments?.[i]?.dueDate || null,
          reminderDate: formik.values.installments?.[i]?.reminderDate || null,
          gracePeriod: formik.values.installments?.[i]?.gracePeriod || null,
          overdueCharges: formik.values.installments?.[i]?.overdueCharges || null,
        }));
        setInstallments(updated);
        formik.setFieldValue('installments', updated);
      } else {
        setInstallments([]);
        formik.setFieldValue('installments', []);
      }
    }, 400);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.totalInstallments]);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" sx={{ height: '100%' }}>
          <Scrollbar sx={{ height: '100%' }}>
            {/* ── Payment Term Details Card ── */}
            <Box
              sx={{
                mx: 2.5,
                mt: 2.5,
                mb: 2,
                p: 2.5,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)',
              }}
            >
              {/* Section header */}
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box
                  sx={{
                    width: 4,
                    height: 20,
                    borderRadius: 1,
                    bgcolor: 'primary.main',
                    flexShrink: 0,
                  }}
                />
                <Typography variant="h6" fontWeight={600} color="text.primary" letterSpacing={0.3}>
                  Payment Term Details
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.paymentTermName && formik.errors.paymentTermName)}
                  >
                    <TextField
                      fullWidth
                      name="paymentTermName"
                      label="Payment Term Name *"
                      value={formik.values.paymentTermName || ''}
                      onChange={(e) => {
                        let value = e.target.value
                          .replace(/[^a-zA-Z0-9\s]/g, '') // Allow letters, numbers, spaces
                          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                          .replace(/^\d+/, '') // Remove leading numbers
                          .trimStart(); // Remove leading spaces
                        value = value
                          .split(' ')
                          .map((word) =>
                            word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                          )
                          .join(' ');
                        formik.setFieldValue('paymentTermName', value);
                      }}
                      error={!!(formik.touched.paymentTermName && formik.errors.paymentTermName)}
                      helperText={formik.touched.paymentTermName && formik.errors.paymentTermName}
                      variant="outlined"
                      size="small"
                      sx={{ '& .MuiFormHelperText-root': { mx: 0, mt: 0.5 } }}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.totalInstallments && formik.errors.totalInstallments)}
                  >
                    <TextField
                      fullWidth
                      name="totalInstallments"
                      label="Total Installments *"
                      type="number"
                      value={formik.values.totalInstallments || ''}
                      onChange={(e) => {
                        formik.handleChange(e);
                        formik.setFieldTouched('totalInstallments', true);
                      }}
                      error={
                        !!(formik.touched.totalInstallments && formik.errors.totalInstallments)
                      }
                      helperText={
                        formik.touched.totalInstallments && formik.errors.totalInstallments
                      }
                      inputProps={{
                        min: 0,
                      }}
                      variant="outlined"
                      size="small"
                      sx={{ '& .MuiFormHelperText-root': { mx: 0, mt: 0.5 } }}
                    />
                  </ShakingTextField>
                </Grid>
              </Grid>
            </Box>

            {/* ── Installment Cards ── */}
            {installments.length > 0 && (
              <Box sx={{ mx: 2.5, mb: 2.5 }}>
                {/* Section header */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 4,
                        height: 20,
                        borderRadius: 1,
                        bgcolor: 'secondary.main',
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="h6" letterSpacing={0.3}>
                      Installment Schedule
                    </Typography>
                  </Box>
                  {/* UI-only badge: shows total installment count at a glance */}
                  <Chip
                    label={`${installments.length} Installment${installments.length !== 1 ? 's' : ''}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                  />
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* One card per installment */}
                <Box display="flex" flexDirection="column" gap={2}>
                  {installments.map((installment, index) => {
                    const nameError = !!(
                      formik?.touched?.installments?.[index]?.installmentName &&
                      Array.isArray(formik?.errors?.installments) &&
                      typeof formik?.errors?.installments?.[index] === 'object' &&
                      (formik.errors.installments[index] as FormikErrors<IInstallment>)
                        ?.installmentName
                    );

                    const dueDateError = !!(
                      formik?.touched?.installments?.[index]?.dueDate &&
                      Array.isArray(formik?.errors?.installments) &&
                      typeof formik?.errors?.installments?.[index] === 'object' &&
                      (formik.errors.installments[index] as FormikErrors<IInstallment>)?.dueDate
                    );

                    const reminderError =
                      Boolean(formik.touched.installments?.[index]?.reminderDate) &&
                      !!(formik.errors.installments?.[index] as any)?.reminderDate;

                    const gracePeriodError =
                      Boolean(formik.touched.installments?.[index]?.gracePeriod) &&
                      !!(formik.errors.installments?.[index] as any)?.gracePeriod;

                    const overdueError =
                      Boolean(formik.touched.installments?.[index]?.overdueCharges !== undefined) &&
                      !!(formik.errors.installments?.[index] as any)?.overdueCharges;

                    return (
                      <Box
                        key={installment.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: '0 1px 4px 0 rgba(0,0,0,0.05)',
                        }}
                      >
                        {/* Card header: installment number badge */}
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              flexShrink: 0,
                            }}
                          >
                            {installment.id}
                          </Box>
                          <Typography variant="body2" fontWeight={600} color="text.secondary">
                            Installment {installment.id}
                          </Typography>
                        </Box>

                        <Grid
                          container
                          spacing={1.5}
                          wrap="nowrap"
                          sx={{ overflowX: 'auto', pt: 1 }}
                        >
                          {/* Installment Name */}
                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <ShakingTextField error={nameError}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Installment Name *"
                                name={`installments.${index}.installmentName`}
                                value={formik.values.installments[index]?.installmentName || ''}
                                onChange={(e) => {
                                  const updated = [...installments];
                                  updated[index].installmentName = e.target.value;
                                  setInstallments(updated);
                                  formik.setFieldTouched(
                                    `installments.${index}.installmentName`,
                                    false
                                  );
                                }}
                                variant="outlined"
                                error={nameError}
                                helperText={
                                  nameError
                                    ? (
                                        formik.errors.installments![
                                          index
                                        ] as FormikErrors<IInstallment>
                                      )?.installmentName
                                    : ''
                                }
                                FormHelperTextProps={{
                                  sx: { margin: 0, position: 'static', whiteSpace: 'normal' },
                                }}
                              />
                            </ShakingTextField>
                          </Grid>

                          {/* Due Date */}
                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <ShakingTextField error={dueDateError}>
                              <DatePicker
                                name={`installments.${index}.dueDate`}
                                label="Due Date *"
                                value={formik.values.installments[index]?.dueDate}
                                onChange={(newValue) => {
                                  const updated = [...installments];
                                  updated[index].dueDate = newValue;
                                  setInstallments(updated);
                                  formik.setFieldTouched(`installments.${index}.dueDate`, false);
                                }}
                                minDate={dayjs(currentYear?.startDate)}
                                maxDate={dayjs(currentYear?.endDate)}
                                format="DD/MM/YYYY"
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    size: 'small',
                                    variant: 'outlined',
                                    error: dueDateError,
                                    helperText: dueDateError
                                      ? (
                                          formik.errors.installments![
                                            index
                                          ] as FormikErrors<IInstallment>
                                        )?.dueDate
                                      : '',
                                    FormHelperTextProps: {
                                      sx: { margin: 0, position: 'static', whiteSpace: 'normal' },
                                    },
                                    sx: {
                                      '& .MuiInputBase-input': {
                                        fontSize: '12px',
                                        px: 1,
                                        py: 0.75,
                                      },
                                      '& .MuiIconButton-root': { padding: '4px' },
                                      '& .MuiInputAdornment-root': { ml: 0 },
                                    },
                                  },
                                }}
                              />
                            </ShakingTextField>
                          </Grid>

                          {/* Reminder Date */}
                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <DatePicker
                              name={`installments.${index}.reminderDate`}
                              label="Reminder Date *"
                              value={formik.values.installments[index]?.reminderDate}
                              minDate={dayjs(currentYear?.startDate)}
                              maxDate={dayjs(currentYear?.endDate)}
                              onChange={(newValue) => {
                                const updated = [...installments];
                                updated[index].reminderDate = newValue;
                                setInstallments(updated);
                                formik.setFieldValue(
                                  `installments.${index}.reminderDate`,
                                  newValue
                                );
                              }}
                              format="DD/MM/YYYY"
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: 'small',
                                  variant: 'outlined',
                                  error: reminderError,
                                  helperText: reminderError
                                    ? (formik.errors.installments?.[index] as any)?.reminderDate
                                    : undefined,
                                  FormHelperTextProps: {
                                    sx: { margin: 0, position: 'static', whiteSpace: 'normal' },
                                  },
                                  sx: {
                                    '& .MuiInputBase-input': { fontSize: '12px', px: 1, py: 0.75 },
                                    '& .MuiIconButton-root': { padding: '4px' },
                                    '& .MuiInputAdornment-root': { ml: 0 },
                                  },
                                },
                              }}
                            />
                          </Grid>

                          {/* Grace Period */}
                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="Grace Period (Days)"
                              name={`installments.${index}.gracePeriod`}
                              inputProps={{ min: 0 }}
                              value={formik.values.installments[index]?.gracePeriod || ''}
                              onChange={(e) => {
                                const updated = [...installments];
                                updated[index].gracePeriod = Number(e.target.value);
                                setInstallments(updated);
                                formik.setFieldValue(
                                  `installments.${index}.gracePeriod`,
                                  e.target.value
                                );
                              }}
                              variant="outlined"
                              error={gracePeriodError}
                              helperText={
                                gracePeriodError
                                  ? (formik.errors.installments?.[index] as any)?.gracePeriod
                                  : undefined
                              }
                              FormHelperTextProps={{
                                sx: { margin: 0, position: 'static', whiteSpace: 'normal' },
                              }}
                            />
                          </Grid>

                          {/* Overdue Charges */}
                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <NumericFormatCustom
                              size="small"
                              fullWidth
                              label="Overdue Charges (Per Day)"
                              name={`installments.${index}.overdueCharges`}
                              value={
                                formik.values.installments[index]?.overdueCharges !== undefined
                                  ? formik.values.installments[index]?.overdueCharges
                                  : ''
                              }
                              onChange={(e) => {
                                let val = e.target.value;
                                val = val.replace(/[₹,\s]/g, '');
                                const numVal = val === '' ? null : Number(val);
                                const updated = [...installments];
                                updated[index].overdueCharges = numVal;
                                setInstallments(updated);
                                formik.setFieldValue(
                                  `installments.${index}.overdueCharges`,
                                  numVal
                                );
                              }}
                              error={overdueError}
                              helperText={
                                overdueError
                                  ? (formik.errors.installments?.[index] as any)?.overdueCharges
                                  : undefined
                              }
                              FormHelperTextProps={{
                                sx: { margin: 0, position: 'static', whiteSpace: 'normal' },
                              }}
                              inputProps={{ min: 0 }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Academic Year, Board, Medium Selects */}
          </Scrollbar>

          {/* ── Footer Actions ── */}
          <DialogActions
            sx={{
              px: 2.5,
              py: 1.75,
              gap: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: '0 -2px 8px 0 rgba(0,0,0,0.06)',
            }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                onClose(null, false);
              }}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.06),
                  borderColor: 'error.main',
                  color: 'error.main',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              startIcon={
                <Iconify
                  icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                  width={editData ? 16 : 20}
                  height={editData ? 16 : 20}
                />
              }
              type="submit"
              size="small"
              variant="contained"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
                boxShadow: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px 0 rgba(0,0,0,0.18)',
                  transform: 'translateY(-1px)',
                },
                '&:active': { transform: 'translateY(0)' },
              }}
            >
              {editData ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default PaymentTermForm;
