import React from 'react';
import { useFormik } from 'formik';

import Grid2 from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Button, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

import type CreateNewFeeStructure from '../data/createNewFeeStructure';
import type FeeStructureOverView from '../data/FeeStructure-interface';

interface FinanceCreateFeeStructureProps {
  dialogValue: boolean;
  onClose: () => void;
  onSave: (values: CreateNewFeeStructure) => void;
  selectedEntry: FeeStructureOverView | null;
}

// const validationSchema = Yup.object({
//   classGrade: Yup.string().required('Required'),
//   tuitionFees: Yup.number().required('Required'),
//   discountPercentage: Yup.number().min(0, 'Must be at least 0').max(100, 'Must be at most 100').required('Required'),
//   libraryFees: Yup.number().required('Required'),
//   fixedReductions: Yup.number().required('Required'),
//   transportFees: Yup.number().required('Required'),
//   otherFees: Yup.number().required('Required'),
//   toDate: Yup.date().required('Required').nullable(),
// });

const FinanceCreateFeeStructureComponent: React.FC<FinanceCreateFeeStructureProps> = ({
  dialogValue,
  onClose,
  onSave,
  selectedEntry,
}) => {
  const formik = useFormik({
    initialValues: {
      classGrade: selectedEntry?.classGrade || '',
      tuitionFees: selectedEntry?.feeType || '',
      discountPercentage: '',
      libraryFees: '',
      fixedReductions: '',
      transportFees: '',
      otherFees: '',
      toDate: null,
    },
    // validationSchema: validationSchema,
    onSubmit: (values: CreateNewFeeStructure) => {
      console.log('Form Submitted:', values);
      onSave(values);
    },
  });

  return (
    <CustomDialog title="Create Fee Structure" open={dialogValue} handleClose={onClose}>
      <Scrollbar>
        <Box px="15px">
          <form onSubmit={formik.handleSubmit}>
            <Box pt="10px" display="flex" flexDirection="column" gap={3}>
              <Grid2 xl={6}>
                <Box py="8px" display="flex" flexDirection="row" gap={3}>
                  <CustomSelect
                    label="Class/Grade"
                    options={[
                      { value: '10', label: '10' },
                      { value: '11', label: '11' },
                      { value: '12', label: '12' },
                    ]}
                    value={formik.values.classGrade}
                    onChange={(e) => formik.setFieldValue('classGrade', '10')}
                    formControlProps={{ sx: { minWidth: 195 } }}
                  />
                  <TextField
                    name="tuitionFees"
                    label="Tuition Fees"
                    value={formik.values.tuitionFees}
                    onChange={formik.handleChange}
                    size="small"
                    error={formik.touched.tuitionFees && Boolean(formik.errors.tuitionFees)}
                    helperText={formik.touched.tuitionFees && formik.errors.tuitionFees}
                  />
                </Box>

                <Box py="8px" display="flex" flexDirection="row" gap={3}>
                  <TextField
                    name="discountPercentage"
                    label="Discount Percentage"
                    value={formik.values.discountPercentage}
                    onChange={formik.handleChange}
                    size="small"
                    error={
                      formik.touched.discountPercentage && Boolean(formik.errors.discountPercentage)
                    }
                    helperText={
                      formik.touched.discountPercentage && formik.errors.discountPercentage
                    }
                  />
                  <TextField
                    name="libraryFees"
                    label="Library Fees"
                    value={formik.values.libraryFees}
                    onChange={formik.handleChange}
                    size="small"
                    error={formik.touched.libraryFees && Boolean(formik.errors.libraryFees)}
                    helperText={formik.touched.libraryFees && formik.errors.libraryFees}
                  />
                </Box>

                <Box display="flex" flexDirection="row" gap={3} py="8px">
                  <TextField
                    name="fixedReductions"
                    label="Fixed Reductions"
                    value={formik.values.fixedReductions}
                    onChange={formik.handleChange}
                    size="small"
                    error={formik.touched.fixedReductions && Boolean(formik.errors.fixedReductions)}
                    helperText={formik.touched.fixedReductions && formik.errors.fixedReductions}
                  />
                  <TextField
                    name="transportFees"
                    label="Transport Fees"
                    value={formik.values.transportFees}
                    onChange={formik.handleChange}
                    size="small"
                    error={formik.touched.transportFees && Boolean(formik.errors.transportFees)}
                    helperText={formik.touched.transportFees && formik.errors.transportFees}
                  />
                </Box>

                <Box display="flex" flexDirection="row" gap={3} py="8px">
                  <Box width="200px">
                    <DatePicker
                      label="To Date"
                      value={formik.values.toDate}
                      onChange={(newValue) => formik.setFieldValue('toDate', newValue)}
                      format="DD-MM-YYYY"
                      slotProps={{ textField: { size: 'small' } }}
                    />
                  </Box>
                  <TextField
                    name="otherFees"
                    label="Other Miscellaneous Fees"
                    value={formik.values.otherFees}
                    onChange={formik.handleChange}
                    size="small"
                    error={formik.touched.otherFees && Boolean(formik.errors.otherFees)}
                    helperText={formik.touched.otherFees && formik.errors.otherFees}
                  />
                </Box>
              </Grid2>
            </Box>

            <DialogActions>
              <Button
                sx={{ backgroundColor: 'lightblue', color: 'blue' }}
                variant="contained"
                onClick={onClose}
                size="small"
              >
                Draft
              </Button>
              <Button
                sx={{ backgroundColor: 'lightgreen', color: 'darkgreen' }}
                type="submit"
                variant="contained"
                size="small"
              >
                Save
              </Button>
            </DialogActions>
          </form>
        </Box>
      </Scrollbar>
    </CustomDialog>
  );
};

export default FinanceCreateFeeStructureComponent;
