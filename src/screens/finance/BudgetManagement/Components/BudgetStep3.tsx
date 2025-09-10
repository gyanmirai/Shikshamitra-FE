import type { FormikProps } from 'formik';

import React from 'react';
import dayjs from 'dayjs';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Card, Chip, Grid, Typography, CardContent } from '@mui/material';

import type { IBudgetFormValues } from './type';

const BudgetInfoCard = (formik: FormikProps<IBudgetFormValues>) => {
  const { values, setFieldValue, touched, setFieldTouched, errors } = formik;

  return (
    <Box>
      <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 2 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            Basic Information
          </Typography>

          <Grid container spacing={2}>
            {/* Budget Title */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Budget Title
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                {values.budgetTitle}
              </Typography>
            </Grid>

            {/* Category */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Category
              </Typography>
              <Typography variant="subtitle1">{values.budgetCategory}</Typography>
            </Grid>

            {/* Threshold */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Threshold Alert
              </Typography>
              <Typography variant="subtitle1">{values.spendingThreshold} %</Typography>
            </Grid>

            {/* Departments */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Assigned Department
              </Typography>
              <Box mt={0.5} display="flex" gap={1} flexWrap="wrap">
                {values.departments.map((dept: string, index: number) => (
                  <Chip key={index} label={dept} size="small" variant="outlined" />
                ))}
              </Box>
            </Grid>

            {/* Total Budget */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Total Budget
              </Typography>
              <Typography variant="subtitle1">
                ₹{values.totalBudgetAmount.toLocaleString()}
              </Typography>
            </Grid>

            {/* Period */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Period
              </Typography>
              <Typography variant="subtitle1">
                {dayjs(values.startDate).format('DD-MM-YYYY')} to{' '}
                {dayjs(values.endDate).format('DD-MM-YYYY')}
              </Typography>
            </Grid>

            {/* Notes */}
            {values.description && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  Notes
                </Typography>
                <Typography variant="body1">{values.description}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            Allocation
          </Typography>
          <CustomizableTable
            tableId="allocation-table"
            noDataText="Allocation Data Not Found"
            isSearch={false}
            isFilter={false}
            isPagination={false}
            columns={[
              { id: 'subCategory', label: 'Sub Category', align: 'left' },
              {
                id: 'amount',
                label: 'Amount',
                align: 'left',
                filterType: 'number',
                render(value) {
                  return new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 2,
                  }).format(value);
                },
              },
              { id: 'notes', label: 'Notes', align: 'left' },
            ]}
            data={values.subCategories}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default BudgetInfoCard;
