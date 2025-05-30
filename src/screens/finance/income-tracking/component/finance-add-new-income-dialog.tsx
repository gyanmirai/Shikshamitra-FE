import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Card, Grid, TextField } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import capitalizeWords from 'src/utils/capitalizeText';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import { addIncomeValidationSchema } from '../validationSchema';
import BudgetCategoryDialog from '../../settings/general-setting/dialog/budget-category-dialog';

import type {
  IFormikValue,
  IFinanceAddNewIncomeDialogProps,
} from '../interface/income-screen-interface';

const FinanceAddNewIncomeDialog: React.FC<IFinanceAddNewIncomeDialogProps> = ({
  dialogValue,
  data,
  onSave,
  onClose,
  isEdit,
  allData,
}) => {
  // State to track and show message when an entry already exists
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState<boolean>(false);

  // Get changes state from redux store to track form modifications
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const dispatch = useDispatch();

  // Initialize form values based on whether we're editing or creating new entry
  const initialValues = useMemo<IFormikValue>(
    () => ({
      incomeSource: isEdit ? (data.incomeSource ?? '') : '',
      incomeAmount: isEdit ? (data.incomeAmount ?? '') : '',
      paymentMethod: isEdit ? (data.paymentMethod ?? '') : '',
      date: isEdit ? dayjs(data.date) : dayjs(), // Set current date as default for new entries
      paymentStatus: isEdit ? (data.paymentStatus ?? '') : '',
      // Generate random ID for new entries or use existing ID when editing
      id: isEdit
        ? (data.id ?? Math.floor(Math.random() * 1000000000))
        : Math.floor(Math.random() * 1000000000),
      incomeName: '',
      notes: '',
    }),
    [data, isEdit]
  );

  // Initialize formik with validation and submission handling
  const formik = useFormik<IFormikValue>({
    initialValues,
    validationSchema: addIncomeValidationSchema,
    onSubmit: (values) => {
      // Normalize strings for case-insensitive comparison
      const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

      // Check if income source already exists in data
      const existingEntryIndex = allData.findIndex(
        (val: any) => normalize(val.incomeSource) === normalize(values.incomeSource)
      );

      if (!isEdit) {
        // For new entries, check for duplicates
        if (existingEntryIndex === -1) {
          setShowExistingEntryMessage(false);
          onSave(values);
        } else {
          setShowExistingEntryMessage(true);
        }
      } else {
        // Allow saving when editing existing entry
        onSave(values);
      }
    },
    enableReinitialize: true,
  });

  // Track form changes and update redux store
  useEffect(() => {
    const isChanged = !isEqual(formik.values, initialValues);
    dispatch(setIsChanges(isChanged));
  }, [dispatch, formik.values, initialValues]);

  // Handle dialog close with unsaved changes confirmation
  const handleCloseDialog = () => {
    if (isChanges && window.confirm('Are you sure you want to leave this page?')) {
      onClose();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      onClose();
    }
  };
  const budgetCategoryDialog = useBoolean();
  return (
    <Box display="flex" flexDirection="column" gap={2} height="100%">
      {/* Header Section */}

      <CustomBreadcrumbs
        heading="Income Tracking"
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Income Tracking' },
          { name: 'Income Tracking Form' },
        ]}
        sx={{ px: 1, mb: 2 }}
        description="The Income Tracking allows you to add and manage income records. Enter the income source, amount, date, and relevant details to keep the system updated with accurate financial data"
        isBack
        onBack={handleCloseDialog}
      />

      {/* Form Card */}
      <form
        onSubmit={formik.handleSubmit}
        style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Card
          sx={{
            height: '100%',
            boxShadow: 'var(--shadows-4)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box display="flex" flexDirection="column" gap={2} height="100%" flexGrow={1}>
            <Box flexGrow={1} p={2}>
              <Grid container spacing={3} pt="10px">
                <Grid item xs={6}>
                  <ShakingTextField
                    error={formik.touched.incomeSource && Boolean(formik.errors.incomeSource)}
                  >
                    <CustomSelect
                      label="Income Category *"
                      options={[
                        { label: 'Donation', value: 'Donation' },
                        { label: 'Fees', value: 'Fees' },
                      ]}
                      value={formik.values.incomeSource}
                      autoFocus
                      onChange={(value) => formik.setFieldValue('incomeSource', value)}
                      formControlProps={{ sx: { minWidth: 140 }, fullWidth: true }}
                      disabled={isEdit}
                      error={formik.touched.incomeSource && Boolean(formik.errors.incomeSource)}
                      helperText={
                        formik.touched.incomeSource ? formik.errors.incomeSource || '' : ''
                      }
                      addOtherItemOnClick={budgetCategoryDialog.onTrue}
                      addOtherItemText="Add New Category"
                    />
                  </ShakingTextField>
                  {budgetCategoryDialog.value && (
                    <CustomDialog
                      title="Add Budget Category "
                      open={budgetCategoryDialog.value}
                      handleClose={budgetCategoryDialog.onFalse}
                    >
                      <BudgetCategoryDialog />
                    </CustomDialog>
                  )}
                </Grid>
                <Grid item xs={6}>
                  <ShakingTextField
                    error={formik.touched.incomeName && Boolean(formik.errors.incomeName)}
                  >
                    <TextField
                      name="incomeName"
                      label="Income Name *"
                      value={formik.values.incomeName}
                      onChange={(e) =>
                        formik.setFieldValue('incomeName', capitalizeWords(e.target.value))
                      }
                      size="small"
                      fullWidth
                      error={formik.touched.incomeName && Boolean(formik.errors.incomeName)}
                      helperText={formik.touched.incomeName && formik.errors.incomeName}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid item xs={6}>
                  <ShakingTextField
                    error={formik.touched.incomeAmount && Boolean(formik.errors.incomeAmount)}
                  >
                    <NumericFormatCustom
                      size="small"
                      label="Income Amount *"
                      name="incomeAmount"
                      value={formik.values.incomeAmount}
                      onChange={formik.handleChange}
                      fullWidth
                      error={formik.touched.incomeAmount && Boolean(formik.errors.incomeAmount)}
                      helperText={formik.touched.incomeAmount && formik.errors.incomeAmount}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid item xs={6}>
                  <ShakingTextField
                    error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                  >
                    <CustomSelect
                      label="Payment Method *"
                      options={[{ label: 'Online', value: 'Online' }]}
                      value={formik.values.paymentMethod}
                      onChange={(value) => formik.setFieldValue('paymentMethod', value)}
                      formControlProps={{ sx: { minWidth: 140 }, fullWidth: true }}
                      disabled={isEdit}
                      error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                      helperText={
                        formik.touched.paymentMethod ? formik.errors.paymentMethod || '' : ''
                      }
                    />
                  </ShakingTextField>
                </Grid>

                <Grid item xs={6}>
                  <DatePicker
                    label="Date *"
                    value={formik.values.date}
                    onChange={(newValue) => formik.setFieldValue('date', newValue)}
                    format="DD-MM-YYYY"
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    disabled={isEdit}
                    // error={Boolean(formik.touched.date && formik.errors.date)}
                    // helperText={formik.touched.date ? formik.errors.date || '' : ''}
                  />
                </Grid>

                {/* <Grid item xs={6}>
                  <CustomSelect
                    label="Payment Status"
                    options={[{ label: 'Paid', value: 'Paid' }]}
                    value={formik.values.paymentStatus}
                    onChange={(value) => formik.setFieldValue('paymentStatus', value)}
                    formControlProps={{ sx: { minWidth: 140 }, fullWidth: true }}
                    disabled={isEdit}
                    error={formik.touched.paymentStatus && Boolean(formik.errors.paymentStatus)}
                    helperText={
                      formik.touched.paymentStatus ? formik.errors.paymentStatus || '' : ''
                    }
                  />
                </Grid> */}

                <Grid item xs={12}>
                  <TextField
                    multiline
                    rows={4}
                    name="notes"
                    label="Notes"
                    value={formik.values.notes}
                    onChange={(e) => {
                      formik.setFieldValue('notes', capitalizeWords(e.target.value));
                    }}
                    size="small"
                    fullWidth
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                    helperText={formik.touched.notes && formik.errors.notes}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* CTA Section */}
          </Box>
          <Box display="flex" justifyContent="flex-end" gap={2} p={2}>
            <SubmitButton onClick={() => {}} />
          </Box>
        </Card>
      </form>
    </Box>
  );
};

export default FinanceAddNewIncomeDialog;
