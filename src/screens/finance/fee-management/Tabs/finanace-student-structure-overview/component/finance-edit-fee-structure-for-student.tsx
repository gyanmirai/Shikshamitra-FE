import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { DatePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

interface FinanceEditFeeStructureForStudentProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
}

const FinanceEditFeeStructureForStudent: React.FC<FinanceEditFeeStructureForStudentProps> = ({
  dialogValue,
  data,
  onClose,
  onSave,
}) => {
  const formik = useFormik({
    initialValues: {
      discountPercantage: 0,
      fixedReduction: 0,
      date: dayjs(data.overAllDueDate, 'DD-MM-YYYY'),
      id: data.studentId,
      totalFee: data.totalFees,
      finalFee: data.finalFees,
    },
    onSubmit: (values: any) => {
      onSave(values);
    },
  });

  return (
    <CustomDialog maxWidth="sm" title="Edit Fee Structure" open={dialogValue} handleClose={onClose}>
      <Box>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: 300 }}>
            {/* Header Info */}
            {/* <Box>
              <Typography fontSize="12px">
                {data.name} | St: {data.grade}
              </Typography>
            </Box> */}

            {/* Form Fields */}
            <Box pt={2}>
              <Grid container spacing={2}>
                {/* Row 1: Class and Student Name */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    name="class"
                    label="Standard"
                    value={data.grade}
                    size="small"
                    disabled
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    name="studentName"
                    label="Student Name"
                    value={data.name}
                    size="small"
                    disabled
                    fullWidth
                  />
                </Grid>

                {/* Row 2: Discount Category and Amount */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomSelect
                    options={[]} // Dynamic options for discount categories
                    label="Additional Discount Category"
                    value={formik.values.discountPercantage}
                    onChange={(e) => {
                      const value = Math.min(100, Math.max(0, Number(e)));
                      formik.setFieldValue('discountPercantage', value);
                    }}
                    formControlProps={{ sx: { minWidth: 275 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    name="fixedReduction"
                    label="Additional Discount Amount"
                    value={formik.values.fixedReduction}
                    onChange={formik.handleChange}
                    size="small"
                    type="number"
                    fullWidth
                    error={Boolean(formik.errors.fixedReduction)}
                  />
                </Grid>

                {/* Dynamic Fee Breakdown */}
                {data.fees.map((fee: any) => (
                  <React.Fragment key={fee.feeHeadId}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label={`Payable ${fee.feeHead} Fee`}
                        value={formatNumber(fee.finalFees, 'INR')}
                        size="small"
                        fullWidth
                        disabled
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label={`${fee.feeHead} Fee Discount`}
                        value={formatNumber(fee.totalDiscount, 'INR')}
                        size="small"
                        fullWidth
                        disabled
                      />
                    </Grid>
                  </React.Fragment>
                ))}

                {/* Row 3: Final and Total Fee */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    name="finalFee"
                    label="Payable Fee"
                    value={formatNumber(formik.values.finalFee, 'INR')}
                    size="small"
                    fullWidth
                    disabled
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    name="totalFee"
                    label="Gross Fee"
                    value={formatNumber(formik.values.totalFee, 'INR')}
                    size="small"
                    fullWidth
                    disabled
                  />
                </Grid>

                {/* Row 4: Due Date */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <DatePicker
                    label="Due Date"
                    value={formik.values.date}
                    format="DD-MM-YYYY"
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    disabled
                  />
                </Grid>
              </Grid>
            </Box>
          </Scrollbar>

          {/* Dialog Actions */}
          <DialogActions>
            {/* <Button onClick={onClose} variant="outlined" size="small">
              Cancel
            </Button> */}
            <Button type="submit" variant="contained" size="small">
              Save
            </Button>
          </DialogActions>
        </form>
      </Box>
    </CustomDialog>
  );
};

export default FinanceEditFeeStructureForStudent;
