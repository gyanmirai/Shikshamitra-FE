import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';

import Grid2 from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import InputAdornment from '@mui/material/InputAdornment';
import { Box, Button, TextField, DialogActions } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';

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
    },
    // validationSchema: validationSchema,
    onSubmit: (values: any) => {
      console.log('Form Submitted type:', values);
      onSave(values);
    },
  });
  console.log('data from parent', data);
  return (
    <CustomDialog title="Edit Fee Structure" open={dialogValue} handleClose={onClose}>
      <Box>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
            <Box pt="10px" display="flex" flexDirection="column" gap={3}>
              <Grid2 xl={6}>
                <Box display="flex" flexDirection="row" gap={2}>
                  <TextField
                    name="class"
                    label="Class/Grade"
                    value={data.grade}
                    onChange={formik.handleChange}
                    size="small"
                    disabled
                  />
                  <TextField
                    name="studentName"
                    label="Student Name"
                    value={data.name}
                    onChange={formik.handleChange}
                    size="small"
                    disabled
                  />
                </Box>
              </Grid2>

              <Grid2 xl={6}>
                <Box display="flex" flexDirection="row" gap={2}>
                  <TextField
                    name="discountAmount"
                    label="Discount Percantage"
                    value={formik.values.discountAmount}
                    onChange={(e) => {
                      const value = Math.min(100, Math.max(0, Number(e.target.value)));
                      formik.setFieldValue('discountAmount', value);
                    }}
                    size="small"
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      inputProps: { min: 0, max: 100 },
                    }}
                    fullWidth
                  />
                  <TextField
                    name="fixedReduction"
                    label="Fixed Reduction"
                    value={formik.values.fixedReduction}
                    onChange={formik.handleChange}
                    size="small"
                    type="number"
                    error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
                    // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
                    fullWidth
                  />
                </Box>
              </Grid2>
              <Grid2 container spacing={2} wrap="wrap">
                {data.fees.map((val: any) => (
                  <Grid2 xl={6} key={val.feeHeadId}>
                    <TextField
                      name={val.feeHead.toLowerCase()}
                      label={val.feeHead}
                      value={formatNumber(val.totalFees, 'INR')}
                      onChange={formik.handleChange}
                      size="small"
                      fullWidth
                      disabled
                    />
                  </Grid2>
                ))}
              </Grid2>
              <DatePicker
                label="Due Date"
                value={formik.values.date}
                //   onChange={(newValue) => formik.setFieldValue('toDate', newValue)}
                format="DD-MM-YYYY"
                slotProps={{ textField: { size: 'small' } }}
                disabled
              />
            </Box>
          </Scrollbar>
          <DialogActions>
            {/* <Button onClick={onClose} variant="contained" size="small">
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
