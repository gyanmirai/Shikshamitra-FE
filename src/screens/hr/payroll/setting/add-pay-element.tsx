import React from 'react';
import { useFormik } from 'formik';

import { Add } from '@mui/icons-material';
import { Box, Grid, Button, Checkbox, TextField, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatCurrency } from 'src/utils/cureencyFormater';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const AddPayElement = () => {
  const dialog = useBoolean(false);
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Button startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
          New Pay Element
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'code', label: 'Code' },
          { id: 'name', label: 'Name' },
          { id: 'payElementType', label: 'Pay element type' },
          {
            id: 'dependAmount',
            label: 'Depend Amount',
            render(value, row) {
              return formatCurrency(value);
            },
          },
          { id: 'dependent', label: 'Dependent' },
        ]}
        data={[
          {
            code: 'PE001',
            name: 'Basic Salary',
            payElementType: 'Credit',
            dependAmount: '5000',
            dependent: 'No',
          },
          {
            code: 'PE002',
            name: 'Housing Allowance',
            payElementType: 'Credit',
            dependAmount: '2000',
            dependent: 'No',
          },
          {
            code: 'PE003',
            name: 'Transportation',
            payElementType: 'Credit',
            dependAmount: '1000',
            dependent: 'No',
          },
          {
            code: 'PE004',
            name: 'Tax Deduction',
            payElementType: 'Debit',
            dependAmount: '500',
            dependent: 'Yes',
          },
        ]}
      />
      <CustomDialog
        maxWidth="sm"
        title="New Pay Element"
        handleClose={dialog.onFalse}
        open={dialog.value}
      >
        <AddPayElementForm />
      </CustomDialog>
    </Box>
  );
};

export default AddPayElement;

const AddPayElementForm = () => {
  const { values, setFieldValue, handleChange, handleSubmit } = useFormik({
    initialValues: {
      code: '',
      name: '',
      payElementType: '',
      employeeSpecific: false,
      depend: false,
      amount: '',
      amountOfPercentage: '',
      paySlip: false,
    },
    onSubmit: () => {},
  });

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="code"
                label="Code"
                value={values.code}
                onChange={() => {}}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Name"
                value={values.name}
                onChange={() => {}}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <CustomSelect
                options={[
                  { label: 'Credit', value: 'credit' },
                  { label: 'Debit', value: 'debit' },
                ]}
                label="Pay Element Type"
                value={values.payElementType}
                onChange={() => {}}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Checkbox size="small" />
                <Typography variant="body2">Employee Specific</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" flexDirection="column" justifyContent="center">
                <Box display="flex" alignItems="center">
                  <Checkbox
                    size="small"
                    checked={values.depend}
                    onChange={(e) => setFieldValue('depend', e.target.checked)}
                  />
                  <Typography variant="body2">Depend</Typography>
                </Box>
                {values.depend && (
                  <Box display="flex" gap={2}>
                    <CustomSelect
                      options={[]}
                      label="Depend Name"
                      value=""
                      onChange={() => {}}
                      formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
                    />
                    <CustomSelect
                      options={[]}
                      label="Amount"
                      value=""
                      onChange={() => {}}
                      formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
                    />
                    <TextField size="small" label="Amount Of Percentage" />
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Checkbox size="small" />
                <Typography variant="body2">is pay slip generate</Typography>
              </Box>
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button variant="contained" onClick={() => {}}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
