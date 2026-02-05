import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetPaymentMethodsConfigQuery } from 'src/redux/finance/expenseApi/expenseDetailedApi';
import { cardStyle } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/homeworkForm';
import {
  useGetIncomeCategoriesQuery,
  useAddIncomeCategoryMutation,
  useUpdateIncomeCategoryMutation,
} from 'src/redux/finance/incomeTrackingManagement/incomeTracking';

import { getInitialIncomeData } from './IncomeInitialValues';
import { getIncomeFormSchema } from './IncomeValidationSchema';
import { paymentMethodsConfig } from '../../FeeCollection/Components/paymentConfigMethods';

import type { IIncomeTrackingFormProps } from './type';

const IncomeTrackingForm: React.FC<IIncomeTrackingFormProps> = ({ open, onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch income options from API
  const { data: incomeOptionsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomeCategoriesQuery,
  });

  // POST mutation for creating
  const [addIncomeCategory, { isLoading: isAddingIncomeCategory }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddIncomeCategoryMutation,
  });

  // PUT mutation for updating
  const [updateIncomeCategory, { isLoading: isUpdatingIncomeCategory }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateIncomeCategoryMutation,
  });

  // Fetch payment methods config from API
  const { data: paymentMethodsConfigData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPaymentMethodsConfigQuery,
  });

  // Extract options from API data with fallbacks
  const categoryOptions = incomeOptionsData?.categoryOptions || [];

  // Use API data for payment methods config, fallback to local config
  const paymentMethodsConfigToUse = paymentMethodsConfigData || [];

  // Generate payment method options from the config
  const paymentMethodOptions =
    incomeOptionsData?.paymentMethodOptions ||
    Object.keys(paymentMethodsConfigToUse).map((method) => ({
      value: method,
      label: method,
    }));

  const formik = useFormik({
    initialValues: getInitialIncomeData(editData),
    validationSchema: getIncomeFormSchema(currentYear),
    onSubmit: async (values) => {
      try {
        setIsLoading(true);

        // Transform form data to API format
        const payload = {
          academicYearId: currentYear?.id,
          categoryId: values.incomeCategory,
          name: values.incomeName,
          categoryTags: values.incomeCategoryTags || [],
          amount: values.amount,
          paymentMethod: values.paymentMethod,
          paymentDate: values.date?.toISOString(),
          notes: values.notes || '',
        };

        if (editData?.id) {
          // Update existing income
          await updateIncomeCategory({
            incomeId: editData.id,
            body: payload,
          }).unwrap();

          shikshaMitraToast.success({
            message: `Income Tracking "${values.incomeName}" updated successfully!`,
          });
        } else {
          // Create new income
          await addIncomeCategory(payload).unwrap();

          shikshaMitraToast.success({
            message: `Income Tracking "${values.incomeName}" added successfully!`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Save operation failed:', error);
        shikshaMitraToast.error({
          message: `Failed to ${editData ? 'update' : 'create'} income tracking`,
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <SectionCard title="Income Details" paperProps={{ sx: { ...cardStyle, mb: 0 } }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <ShakingTextField
                      error={!!(formik.touched.incomeCategory && formik.errors.incomeCategory)}
                    >
                      <CustomSelect
                        label="Income Category *"
                        options={incomeOptionsData || []}
                        value={formik.values.incomeCategory}
                        onChange={(val) => {
                          formik.setFieldValue('incomeCategory', val);
                          formik.setFieldTouched('incomeCategory', false);
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          const selectedCategory = categoryOptions.find(
                            (cat: { value: string; budget?: string }) => cat.value === val
                          );
                        }}
                        error={!!(formik.touched.incomeCategory && formik.errors.incomeCategory)}
                        helperText={
                          (formik.touched.incomeCategory && formik.errors.incomeCategory) as string
                        }
                        formControlProps={{ fullWidth: true }}
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <ShakingTextField
                      error={
                        !!(formik.touched.incomeCategoryTags && formik.errors.incomeCategoryTags)
                      }
                    >
                      <CustomSelect
                        label="Income Category Tags *"
                        options={[
                          { value: 'Donation', label: 'Donation' },
                          { value: 'Grant', label: 'Grant' },
                          { value: 'Fee', label: 'Fee' },
                          { value: 'Fundraiser', label: 'Fundraiser' },
                          { value: 'Sponsorship', label: 'Sponsorship' },
                          { value: 'Other', label: 'Other' },
                        ]}
                        value={formik.values.incomeCategoryTags || []}
                        onChange={(val) => formik.setFieldValue('incomeCategoryTags', val)}
                        error={
                          !!(formik.touched.incomeCategoryTags && formik.errors.incomeCategoryTags)
                        }
                        helperText={
                          (formik.touched.incomeCategoryTags &&
                            formik.errors.incomeCategoryTags) as string
                        }
                        formControlProps={{ fullWidth: true }}
                        multiple
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <ShakingTextField
                      error={!!(formik.touched.incomeName && formik.errors.incomeName)}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        label="Income Name *"
                        name="incomeName"
                        value={formik.values.incomeName}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/[^a-zA-Z0-9\s]/g, '')
                            .split(' ')
                            .map((word) =>
                              word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                            )
                            .join(' ');
                          formik.setFieldValue('incomeName', value);
                        }}
                        error={!!(formik.touched.incomeName && formik.errors.incomeName)}
                        helperText={formik.touched.incomeName && formik.errors.incomeName}
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <ShakingTextField error={!!(formik.touched.amount && formik.errors.amount)}>
                      <NumericFormatCustom
                        size="small"
                        fullWidth
                        label="Amount *"
                        name="amount"
                        value={formik.values.amount || ''}
                        onChange={(e) => {
                          let val = e.target.value;
                          val = val.replace(/[₹,\s]/g, '');
                          formik.setFieldValue('amount', Number(val));
                        }}
                        error={!!(formik.touched.amount && formik.errors.amount)}
                        helperText={formik.touched.amount && formik.errors.amount}
                        sx={{
                          width: '100%',
                          padding: '0',
                          borderRadius: 1,
                        }}
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <ShakingTextField error={!!(formik.touched.date && formik.errors.date)}>
                      <DatePicker
                        label="Date *"
                        value={formik.values.date}
                        onChange={(newValue) => formik.setFieldValue('date', newValue)}
                        minDate={dayjs(currentYear?.startDate)}
                        maxDate={dayjs(currentYear?.endDate)}
                        format="DD/MM/YYYY"
                        disableFuture
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            error: !!(formik.touched.date && formik.errors.date),
                            helperText: formik.touched.date && formik.errors.date,
                          },
                        }}
                      />
                    </ShakingTextField>
                  </Grid>
                </SectionCard>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <SectionCard
                  title="Payment Information"
                  paperProps={{ sx: { ...cardStyle, mb: 0 } }}
                >
                  <Grid size={{ xs: 12, md: 6 }}>
                    <ShakingTextField
                      error={!!(formik.touched.paymentMethod && formik.errors.paymentMethod)}
                    >
                      <CustomSelect
                        label="Payment Method *"
                        options={Object.keys(paymentMethodsConfig).map((method) => ({
                          value: method,
                          label: method.charAt(0).toUpperCase() + method.slice(1),
                        }))}
                        value={formik.values.paymentMethod}
                        onChange={(val) => {
                          formik.setFieldValue('paymentMethod', val);
                        }}
                        error={!!(formik.touched.paymentMethod && formik.errors.paymentMethod)}
                        helperText={
                          (formik.touched.paymentMethod && formik.errors.paymentMethod) as string
                        }
                        formControlProps={{ fullWidth: true }}
                      />
                    </ShakingTextField>
                  </Grid>
                </SectionCard>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <SectionCard
                  title="Additional Information"
                  paperProps={{ sx: { ...cardStyle, mb: 0 } }}
                >
                  <Grid size={12}>
                    <ShakingTextField>
                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Notes"
                        name="notes"
                        value={formik.values.notes}
                        onChange={formik.handleChange}
                      />
                    </ShakingTextField>
                  </Grid>
                </SectionCard>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onClose(null, false)}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <LoadingButton
              startIcon={
                <Iconify
                  icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                  width={16}
                  height={16}
                />
              }
              type="submit"
              size="small"
              variant="contained"
              loading={isAddingIncomeCategory || isUpdatingIncomeCategory}
            >
              {editData ? 'Update' : 'Submit'}
            </LoadingButton>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default IncomeTrackingForm;
