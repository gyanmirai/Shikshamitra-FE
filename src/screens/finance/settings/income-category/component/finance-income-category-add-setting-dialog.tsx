import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, TextField, Typography, DialogActions } from '@mui/material';

interface FinanceIncomeCategoryAddSettingDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

interface FormikValue {
  categoryName: string;
  discription: string;
  incomeType: string;
  effectiveDate: string;
  amount: string;
}

const FinanceIncomeCategoryAddSettingDialog: React.FC<
  FinanceIncomeCategoryAddSettingDialogProps
> = ({ dialogValue, data, onClose, onSave, isEdit, allData }) => {
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);

  const formik = useFormik<FormikValue>({
    initialValues: {
      categoryName: isEdit ? (data.categoryName ?? '') : '',
      discription: isEdit ? (data.parentCategory ?? '') : '',
      incomeType: isEdit ? (data.incomeType ?? '') : '',
      effectiveDate: isEdit ? (data.effectiveDate ?? '') : '',
      amount: isEdit ? (data.amount ?? '') : '',
    },
    // validationSchema: validationSchema,  // Uncomment this if you have validation schema
    onSubmit: (values) => {
      const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

      const existingEntryIndex = allData.findIndex(
        (val: any) => normalize(val.categoryName) === normalize(values.categoryName)
      );
      if (!isEdit) {
        if (existingEntryIndex === -1) {
          setShowExistingEntryMessage(false);
          onSave(values);
        } else {
          setShowExistingEntryMessage(true);
        }
      } else {
        onSave(values);
      }
    },
  });

  return (
    <CustomDialog
      title={`${isEdit ? 'Edit' : 'Create New'} Income Category`}
      open={dialogValue}
      handleClose={onClose}
    >
      <Box px="20px">
        {showExistingEntryMessage ? (
          <Typography component="span" fontSize="14" color="red">
            This Income Category is Already Exists
          </Typography>
        ) : (
          <Box height="25px" />
        )}
      </Box>
      <Scrollbar>
        <Box px="15px">
          <form onSubmit={formik.handleSubmit}>
            <Box pt="10px" display="flex" flexDirection="column" gap={3}>
              <TextField
                disabled={isEdit}
                name="categoryName"
                label="Income Source Name"
                value={formik.values.categoryName}
                onChange={formik.handleChange}
                size="small"

                // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
                // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
              />
              <TextField
                multiline
                rows={4}
                disabled={isEdit}
                name="discription"
                label="Discription"
                value={formik.values.discription}
                onChange={formik.handleChange}
                size="small"

                // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
                // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
              />

              <TextField
                disabled={isEdit}
                name="incomeType"
                label="Income Type"
                value={formik.values.incomeType}
                onChange={formik.handleChange}
                size="small"

                // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
                // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
              />
              <TextField
                // disabled={isEdit}
                name="amount"
                label="Amount"
                value={formik.values.amount}
                onChange={formik.handleChange}
                size="small"

                // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
                // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
              />
            </Box>
            <DialogActions>
              <Button onClick={onClose} variant="contained" size="small">
                Cancel
              </Button>
              <Button type="submit" variant="contained" size="small">
                Save
              </Button>
            </DialogActions>
          </form>
        </Box>
      </Scrollbar>
    </CustomDialog>
  );
};

export default FinanceIncomeCategoryAddSettingDialog;
