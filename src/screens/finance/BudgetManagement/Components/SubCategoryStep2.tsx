import type { FormikProps } from 'formik';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Grid, Chip, TextField, Typography, IconButton } from '@mui/material';

import type { IBudgetFormValues } from './type';

const Step2Allocation = (formik: FormikProps<IBudgetFormValues>) => {
  const { values, setFieldValue, touched, setFieldTouched, errors } = formik;

  // Calculate total allocated amount
  // const totalAllocated = values.subCategories.reduce((sum, item) => {
  //   const amount =
  //     typeof item.amount === 'string' ? parseFloat(item.amount) || 0 : item.amount || 0;
  //   return sum + amount;
  // }, 0);

  // Calculate remaining budget
  // const remainingBudget = Number(values.totalBudgetAmount) - totalAllocated;
  // const isOverBudget = remainingBudget < 0;

  const handleRemove = (index: number) => {
    const updated = [...values.subCategories];
    updated.splice(index, 1);
    setFieldValue('subCategories', updated);
  };

  return (
    <Box>
      {/* Total Budget Amount */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Total Budget Amount: ₹{Number(values.totalBudgetAmount).toLocaleString('en-IN')}
      </Typography>

      {/* Sub Category Items */}
      {values.subCategories.map((item, index) => (
        <Grid
          key={index}
          container
          spacing={2}
          alignItems="center"
          sx={{
            border: '1px dashed #ccc',
            borderRadius: 2,
            mb: 2,
            pt: 1.5,
            pb: 1.5,
          }}
        >
          {/* Index */}
          <Grid size={{ xs: 12, md: 1 }} pl={1}>
            <Typography variant="h6">{index + 1}.</Typography>
          </Grid>

          {/* Category (Chip) */}
          <Grid size={{ xs: 12, md: 2 }}>
            <Chip label={item.category} color="default" variant="outlined" />
          </Grid>

          {/* Sub Category */}
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label={
                values.budgetCategory === 'Income' ? 'Income Category *' : 'Expense Category *'
              }
              value={item.subCategory}
              fullWidth
              disabled
              size="small"
            />
          </Grid>

          {/* Amount */}
          <Grid size={{ xs: 12, md: 3 }}>
            <ShakingTextField
              error={
                !!(
                  touched?.subCategories?.[index]?.amount &&
                  (typeof errors?.subCategories?.[index] === 'object'
                    ? errors?.subCategories?.[index]?.amount
                    : undefined)
                )
              }
            >
              <NumericFormatCustom
                size="small"
                fullWidth
                label="Amount *"
                name={`subCategories[${index}].amount`}
                value={item.amount || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/[₹,\s]/g, '');
                  setFieldValue(`subCategories[${index}].amount`, Number(val));
                  setFieldTouched(`subCategories.${index}.amount`, false);
                }}
                error={
                  !!(
                    touched?.subCategories?.[index]?.amount &&
                    (typeof errors?.subCategories?.[index] === 'object'
                      ? errors?.subCategories?.[index]?.amount
                      : undefined)
                  )
                }
                helperText={
                  touched?.subCategories?.[index]?.amount
                    ? typeof errors?.subCategories?.[index] === 'object'
                      ? errors?.subCategories?.[index]?.amount
                      : errors?.subCategories?.[index]
                    : ''
                }
                sx={{ width: '100%', padding: 0, borderRadius: 1 }}
              />
            </ShakingTextField>
          </Grid>

          {/* Notes */}
          <Grid size={{ xs: 12, md: 2 }}>
            <ShakingTextField
              error={
                !!(
                  touched?.subCategories?.[index]?.notes &&
                  (typeof errors?.subCategories?.[index] === 'object'
                    ? errors?.subCategories?.[index]?.notes
                    : undefined)
                )
              }
            >
              <TextField
                label="Notes"
                value={item.notes}
                onChange={(e) => {
                  setFieldValue(`subCategories[${index}].notes`, e.target.value);
                  setFieldTouched(`subCategories.${index}.notes`, false);
                }}
                error={
                  !!(
                    touched?.subCategories?.[index]?.notes &&
                    (typeof errors?.subCategories?.[index] === 'object'
                      ? errors?.subCategories?.[index]?.notes
                      : undefined)
                  )
                }
                helperText={
                  touched?.subCategories?.[index]?.notes
                    ? typeof errors?.subCategories?.[index] === 'object'
                      ? errors?.subCategories?.[index]?.notes
                      : errors?.subCategories?.[index]
                    : ''
                }
                fullWidth
                size="small"
              />
            </ShakingTextField>
          </Grid>

          {/* Delete Button */}
          <Grid size={{ xs: 12, md: 1 }} textAlign="center">
            <IconButton color="error" onClick={() => handleRemove(index)}>
              <Iconify icon={GlobalIcons.delete} />
            </IconButton>
          </Grid>
        </Grid>
      ))}
    </Box>
  );
};

export default Step2Allocation;
