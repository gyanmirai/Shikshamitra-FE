import React from 'react';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import Grid2 from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Button, Tooltip, TextField, Typography, DialogActions } from '@mui/material';

import capitalizeWords from 'src/utils/capitalizeText';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { Iconify } from 'src/components/iconify/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';

interface FinanceReconciliationClearAndBounceChequeDialogProps {
  fromClearCheck: boolean;
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
}

const validationSchema = Yup.object({
  checkBounceCharges: Yup.string().required('Bounce Charges is required'),
  checkBounceReason: Yup.string().required('Reason is required'),
});

const FinanceReconciliationClearAndBounceChequeDialog: React.FC<
  FinanceReconciliationClearAndBounceChequeDialogProps
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
    validationSchema,
    onSubmit: (values: any) => {
      onSave(values);
    },
  });
  return (
    <CustomDialog
      title={
        <Box display="flex" flexDirection="row" gap={2} alignItems="center">
          <Typography variant="h5">
            {fromClearCheck ? 'Clearing Cheque' : 'Bounce Cheque'}
          </Typography>
          <Tooltip
            arrow
            placement="right"
            title={
              fromClearCheck
                ? 'If a payment is made by cheque and it has been cleared, simply click the Cleared Cheque button to ensure our system reflects the latest data accurately.'
                : 'This is the Bounced Cheque dialog, where you can mark a cheque as bounced. You can manually enter the reason for the bounce and apply any applicable bounced cheque charges before updating the system.'
            }
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </Tooltip>
        </Box>
      }
      // title={fromClearCheck ? 'Clear Cheque' : 'Bounce Cheque'}
      open={dialogValue}
      handleClose={onClose}
      maxWidth="md"
    >
      <Box>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
            <Box pt="10px" display="flex" flexDirection="column" gap={3}>
              <Grid2 container spacing={2}>
                <Grid2 xs={6}>
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
                </Grid2>
                <Grid2 xs={6}>
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
                </Grid2>
              </Grid2>
              <Grid2 container spacing={2}>
                <Grid2 xs={6}>
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
                </Grid2>
                <Grid2 xs={6}>
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
                </Grid2>
              </Grid2>
              <Grid2 container spacing={2}>
                <Grid2 xs={6}>
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
                </Grid2>
                <Grid2 xs={6}>
                  <DatePicker
                    label="Cheque Date"
                    value={formik.values.chequeDate}
                    onChange={(newValue) => formik.setFieldValue('chequeDate', newValue)}
                    format="DD-MM-YYYY"
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    disabled
                  />
                </Grid2>
              </Grid2>
              <Grid2 container spacing={2}>
                <Grid2 xs={6}>
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
                </Grid2>
                {fromClearCheck && (
                  <Grid2 xs={6}>
                    <DatePicker
                      label="Cheque Clear Date"
                      value={formik.values.chequeClearDate}
                      onChange={(newValue) => formik.setFieldValue('chequeClearDate', newValue)}
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                        },
                      }}
                    />
                  </Grid2>
                )}
                {!fromClearCheck && (
                  <Grid2 xs={6}>
                    <DatePicker
                      label="Cheque Bounce Date"
                      value={formik.values.checkBounceDate}
                      onChange={(newValue) => formik.setFieldValue('checkBounceDate', newValue)}
                      format="DD-MM-YYYY"
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </Grid2>
                )}
              </Grid2>
              {!fromClearCheck && (
                <Grid2 container spacing={2}>
                  {/* Check Bounce Reason */}
                  <Grid2 xs={6}>
                    <ShakingTextField
                      error={
                        formik.touched.checkBounceReason && Boolean(formik.errors.checkBounceReason)
                      }
                    >
                      <TextField
                        size="small"
                        label="Check Bounce Reason"
                        name="checkBounceReason"
                        value={formik.values.checkBounceReason}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        fullWidth
                        error={
                          formik.touched.checkBounceReason &&
                          Boolean(formik.errors.checkBounceReason)
                        }
                        helperText={
                          formik.touched.checkBounceReason &&
                          (formik.errors.checkBounceReason as string)
                        }
                      />
                    </ShakingTextField>
                  </Grid2>

                  {/* Bounce Charges */}
                  <Grid2 xs={6}>
                    <ShakingTextField
                      error={
                        formik.touched.checkBounceCharges &&
                        Boolean(formik.errors.checkBounceCharges)
                      }
                    >
                      <NumericFormatCustom
                        size="small"
                        name="checkBounceCharges"
                        label="Bounce Charges"
                        value={formik.values.checkBounceCharges}
                        onChange={formik.handleChange}
                        fullWidth
                        error={
                          formik.touched.checkBounceCharges &&
                          Boolean(formik.errors.checkBounceCharges)
                        }
                        helperText={
                          formik.touched.checkBounceCharges &&
                          (formik.errors.checkBounceCharges as string)
                        }
                      />
                    </ShakingTextField>
                  </Grid2>
                </Grid2>
              )}
            </Box>
            <Box pt="17px" />

            <TextField
              multiline
              rows={3}
              name="remarks"
              label="Remarks"
              value={formik.values.remarks}
              onChange={(e) => {
                formik.setFieldValue('remarks', capitalizeWords(e.target.value));
              }}
              size="small"
              type="text"
              fullWidth
            />
          </Scrollbar>
          <DialogActions>
            {/* <Button onClick={onClose} variant="contained" size="small">
            Cancel
          </Button> */}
            <Button
              disabled={!fromClearCheck && !formik.isValid}
              type="submit"
              variant="contained"
              size="small"
            >
              Save
            </Button>
          </DialogActions>
        </form>
      </Box>
    </CustomDialog>
  );
};

export default FinanceReconciliationClearAndBounceChequeDialog;

function dayJs(chequeDate: any, arg1: string) {
  throw new Error('Function not implemented.');
}
