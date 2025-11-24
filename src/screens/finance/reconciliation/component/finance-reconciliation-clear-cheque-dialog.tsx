import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { reconciliationDialogValidationSchema } from '../validationSchema';

import type { IFinanceReconciliationClearAndBounceChequeDialogProps } from '../reconciliation-dialog-interface';

const FinanceReconciliationClearAndBounceChequeDialog: React.FC<
  IFinanceReconciliationClearAndBounceChequeDialogProps
> = ({ fromClearCheck, dialogValue, data, onSave, onClose }) => {
  const formik = useFormik({
    initialValues: {
      grNumber: '',
      studentName: data.studentName,
      class: data.class,
      chequeNo: data.chequeNo,
      bankName: data.bankName,
      chequeDate: dayjs(data.chequeDate, 'DD-MM-YYYY'),
      amount: data.amount,
      id: data.id,
      checkBounceDate: dayjs(),
      checkBounceCharges: '',
      checkBounceReason: '',
      remarks: '',
      chequeClearDate: dayjs(),
    },
    validationSchema: reconciliationDialogValidationSchema,
    onSubmit: (values: any) => {
      onSave(values);
      onClose(null, true);
    },
  });
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Typography variant="h5">
              {fromClearCheck ? 'Clearing Cheque' : 'Bounce Cheque'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title={
                fromClearCheck
                  ? 'If a payment is made by cheque and it has been cleared, simply click the Cleared Cheque button to ensure our system reflects the latest data accurately.'
                  : 'This is the Bounced Cheque dialog, where you can mark a cheque as bounced. You can manually enter the reason for the bounce and apply any applicable bounced cheque charges before updating the system.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={dialogValue}
        handleClose={() => onClose(null, false)}
        maxWidth="md"
      >
        <DialogScrollContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="grNumber"
                label="GR Number"
                value={formik.values.grNumber}
                onChange={formik.handleChange}
                size="small"
                type="text"
                fullWidth
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="studentName"
                label="Student Name"
                value={formik.values.studentName}
                onChange={formik.handleChange}
                size="small"
                type="text"
                fullWidth
                disabled
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="class"
                label="Class"
                value={formik.values.class}
                onChange={formik.handleChange}
                size="small"
                type="text"
                fullWidth
                disabled
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="chequeNo"
                label="Cheque No"
                value={formik.values.chequeNo}
                onChange={formik.handleChange}
                size="small"
                type="number"
                fullWidth
                disabled
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="bankName"
                label="Bank Name"
                value={formik.values.bankName}
                onChange={formik.handleChange}
                size="small"
                type="text"
                fullWidth
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Cheque Date"
                value={formik.values.chequeDate}
                onChange={(newValue) => formik.setFieldValue('chequeDate', newValue)}
                format="DD-MM-YYYY"
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                disabled
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="amount"
                label="Paid Amount"
                value={formik.values.amount}
                onChange={formik.handleChange}
                size="small"
                type="text"
                fullWidth
                disabled
              />
            </Grid>

            {fromClearCheck && (
              <Grid size={{ xs: 6 }}>
                <DatePicker
                  label="Cheque Clear Date"
                  value={formik.values.chequeClearDate}
                  onChange={(newValue) => formik.setFieldValue('chequeClearDate', newValue)}
                  format="DD-MM-YYYY"
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
            )}

            {!fromClearCheck && (
              <Grid size={{ xs: 6 }}>
                <DatePicker
                  label="Cheque Bounce Date *"
                  value={formik.values.checkBounceDate}
                  onChange={(newValue) => formik.setFieldValue('checkBounceDate', newValue)}
                  format="DD-MM-YYYY"
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
            )}

            {!fromClearCheck && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={
                    formik.touched.checkBounceCharges && Boolean(formik.errors.checkBounceCharges)
                  }
                >
                  <NumericFormatCustom
                    size="small"
                    name="checkBounceCharges"
                    label="Bounce Charges *"
                    value={formik.values.checkBounceCharges}
                    onChange={formik.handleChange}
                    fullWidth
                    error={
                      formik.touched.checkBounceCharges && Boolean(formik.errors.checkBounceCharges)
                    }
                    helperText={
                      formik.touched.checkBounceCharges &&
                      (formik.errors.checkBounceCharges as string)
                    }
                  />
                </ShakingTextField>
              </Grid>
            )}

            {!fromClearCheck && (
              <Grid size={{ xs: 12 }}>
                <ShakingTextField
                  error={
                    formik.touched.checkBounceReason && Boolean(formik.errors.checkBounceReason)
                  }
                >
                  <TextField
                    size="small"
                    label="Check Bounce Reason *"
                    name="checkBounceReason"
                    multiline
                    rows={2}
                    value={formik.values.checkBounceReason}
                    onChange={formik.handleChange}
                    autoFocus
                    fullWidth
                    error={
                      formik.touched.checkBounceReason && Boolean(formik.errors.checkBounceReason)
                    }
                    helperText={
                      formik.touched.checkBounceReason &&
                      (formik.errors.checkBounceReason as string)
                    }
                  />
                </ShakingTextField>
              </Grid>
            )}
          </Grid>
        </DialogScrollContent>

        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Box display="flex" gap={2} width="100%" flexDirection="row" justifyContent="flex-end">
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => onClose(null, false)}
              variant="outlined"
              size="small"
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="small"
              onClick={(e: any) => formik.handleSubmit(e)}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              Submit
            </Button>
          </Box>
        </DialogActions>
      </CustomDialog>
    </BackPopUpChecked>
  );
};

export default FinanceReconciliationClearAndBounceChequeDialog;
