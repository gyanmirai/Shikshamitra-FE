import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Grid,
  Switch,
  Button,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { SectionCard } from '../../employee/employee-form-fields/InformationFields';

const DeductionComponent = ({
  isDeductionComponentOpen,
}: {
  isDeductionComponentOpen: UseBooleanReturn;
}) => {
  const [editData, setEditData] = useState<any>(null);

  return (
    <Box>
      <CustomizableTable
        tableId="earning-component"
        columns={[
          { id: 'name', label: 'Name', align: 'left', minWidth: '10vw' },
          { id: 'description', label: 'Description', align: 'left', minWidth: '10vw' },

          {
            id: 'action',
            label: 'Action',
            minWidth: '4vw',
            align: 'left',
            sticky: true,
            isSort: false,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showThreeDots={false}
                  showEditIcon
                  showDeleteIcon
                  handleEditClick={() => {
                    setEditData(row);
                    isDeductionComponentOpen.onTrue();
                  }}
                  handleDeleteClick={() => {}}
                />
              );
            },
          },
        ]}
        data={[
          {
            name: 'Basic Salary',
            description: 'Base salary component',
            componentType: 'Fixed',
            dependOn: 'None',
            amount: '30000',
            visibleInPayslip: true,
          },
          {
            name: 'House Rent Allowance',
            description: 'HRA component',
            componentType: 'Fixed',
            dependOn: 'Basic',
            amount: '40%',
            visibleInPayslip: true,
          },
          {
            name: 'Performance Bonus',
            description: 'Quarterly performance bonus',
            componentType: 'Variable',
            dependOn: 'Basic',
            amount: '15%',
            visibleInPayslip: true,
          },
          {
            name: 'Transport Allowance',
            description: 'Monthly transport allowance',
            componentType: 'Fixed',
            dependOn: 'None',
            amount: '3000',
            visibleInPayslip: true,
          },
          {
            name: 'Special Allowance',
            description: 'Additional benefits',
            componentType: 'Variable',
            dependOn: 'Gross',
            amount: '10%',
            visibleInPayslip: false,
          },
        ]}
      />
      <CustomDialog
        maxWidth="md"
        open={isDeductionComponentOpen.value}
        handleClose={() => {
          isDeductionComponentOpen.onFalse();
          setEditData(null);
        }}
        title="Deduction Component"
      >
        <DeductionComponentForm
          editData={editData}
          handleClose={() => {
            isDeductionComponentOpen.onFalse();
            setEditData(null);
          }}
        />
      </CustomDialog>
    </Box>
  );
};

export default DeductionComponent;

const genders = ['Male', 'Female', 'Other'];
const salaryRanges = ['Basic', 'Gross', 'CTC'];
const deductionFrequencies = ['Monthly', 'Quarterly', 'Yearly'];

const validationSchema = Yup.object({
  componentName: Yup.string().required('Required'),
  componentType: Yup.string().required('Required'),
  description: Yup.string(),
  // Add more validation rules as per your requirement
});

const DeductionComponentForm = ({
  editData,
  handleClose,
}: {
  editData: any;
  handleClose: () => void;
}) => {
  const formik = useFormik({
    initialValues: {
      componentName: editData?.name || '',
      componentType: editData?.componentType || '',
      description: editData?.description || '',
      visibleInPayslip: editData?.visibleInPayslip || true,

      // PF
      employeePercentage: editData?.employeePercentage || '',
      employerPercentage: editData?.employerPercentage || '',

      // PT
      ptGender: editData?.ptGender || '',
      ptFromSalary: editData?.ptFromSalary || '',
      ptToSalary: editData?.ptToSalary || '',
      ptTaxAmount: editData?.ptTaxAmount || '',

      // TDS
      tdsFromSalary: editData?.tdsFromSalary || '',
      tdsToSalary: editData?.tdsToSalary || '',
      tdsAmount: editData?.tdsAmount || '',

      // LWF
      lwfEmployee: editData?.lwfEmployee || '',
      lwfEmployer: editData?.lwfEmployer || '',
      lwfFrequency: editData?.lwfFrequency || '',

      // ESI
      esiEmployee: editData?.esiEmployee || '',
      esiEmployer: editData?.esiEmployer || '',
      esiCap: editData?.esiCap || '',
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <>
      <DialogScrollContent>
        {/* General Information */}
        <SectionCard title="General Information">
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              fullWidth
              label="Component Name *"
              name="componentName"
              value={formik.values.componentName}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              select
              fullWidth
              label="Component Type *"
              name="componentType"
              value={formik.values.componentType}
              onChange={formik.handleChange}
            >
              {['Deduction', 'Tax', 'Other'].map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              size="small"
              fullWidth
              multiline
              rows={2}
              label="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </Grid>
        </SectionCard>

        {/* Earning Configuration */}
        <SectionCard title="Deduction Configuration">
          <Grid item xs={12}>
            <Typography variant="subtitle2">For Provident Fund (PF)</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              label="Employee Percentage"
              name="employeePercentage"
              fullWidth
              value={formik.values.employeePercentage}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              label="Employer Percentage"
              name="employerPercentage"
              fullWidth
              value={formik.values.employerPercentage}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  name="visibleInPayslip"
                  checked={formik.values.visibleInPayslip}
                  onChange={formik.handleChange}
                />
              }
              label="Visible in Payslip"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">For Professional Tax (PT)</Typography>
          </Grid>
          <Grid item xs={6} sm={3} sx={{ pt: '8px !important' }}>
            <TextField
              size="small"
              select
              label="Gender"
              name="ptGender"
              fullWidth
              value={formik.values.ptGender}
              onChange={formik.handleChange}
            >
              {genders.map((gender) => (
                <MenuItem key={gender} value={gender}>
                  {gender}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3} sx={{ pt: '8px !important' }}>
            <TextField
              size="small"
              select
              label="From Salary"
              name="ptFromSalary"
              fullWidth
              value={formik.values.ptFromSalary}
              onChange={formik.handleChange}
            >
              {salaryRanges.map((range) => (
                <MenuItem key={range} value={range}>
                  {range}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3} sx={{ pt: '8px !important' }}>
            <TextField
              size="small"
              label="To Salary"
              name="ptToSalary"
              fullWidth
              value={formik.values.ptToSalary}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={6} sm={3} sx={{ pt: '8px !important' }}>
            <TextField
              size="small"
              label="Tax Amount"
              name="ptTaxAmount"
              fullWidth
              value={formik.values.ptTaxAmount}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">For Tax Deducted at Source (TDS)</Typography>
          </Grid>
          <Grid item xs={6} sm={4} sx={{ pt: '8px !important' }}>
            <TextField
              size="small"
              label="From Salary"
              name="tdsFromSalary"
              fullWidth
              value={formik.values.tdsFromSalary}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={6} sm={4} sx={{ pt: '8px !important' }}>
            <TextField
              size="small"
              label="To Salary"
              name="tdsToSalary"
              fullWidth
              value={formik.values.tdsToSalary}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4} sx={{ pt: '8px !important' }}>
            <TextField
              size="small"
              label="TDS Amount/Percentage"
              name="tdsAmount"
              fullWidth
              value={formik.values.tdsAmount}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">For Labour Welfare Fund (LWF)</Typography>
          </Grid>
          <Grid item xs={6} sm={4} sx={{ pt: '8px !important' }}>
            <TextField
              size="small"
              label="Employee Contribution"
              name="lwfEmployee"
              fullWidth
              value={formik.values.lwfEmployee}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={6} sm={4} sx={{ pt: '8px !important' }}>
            <TextField
              size="small"
              label="Employer Contribution"
              name="lwfEmployer"
              fullWidth
              value={formik.values.lwfEmployer}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4} sx={{ pt: '8px !important' }}>
            <TextField
              size="small"
              select
              label="Deduction Frequency"
              name="lwfFrequency"
              fullWidth
              value={formik.values.lwfFrequency}
              onChange={formik.handleChange}
            >
              {deductionFrequencies.map((freq) => (
                <MenuItem key={freq} value={freq}>
                  {freq}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">For Employee State Insurance (ESI)</Typography>
          </Grid>
          <Grid item xs={6} sm={4} sx={{ pt: '8px !important' }}>
            <TextField
              size="small"
              label="Employee Contribution"
              name="esiEmployee"
              fullWidth
              value={formik.values.esiEmployee}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={6} sm={4} sx={{ pt: '8px !important' }}>
            <TextField
              size="small"
              label="Employer Contribution"
              name="esiEmployer"
              fullWidth
              value={formik.values.esiEmployer}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4} sx={{ pt: '8px !important' }}>
            <TextField
              size="small"
              label="ESI Eligibility Salary Cap"
              name="esiCap"
              fullWidth
              value={formik.values.esiCap}
              onChange={formik.handleChange}
            />
          </Grid>
        </SectionCard>
      </DialogScrollContent>
      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
          variant="outlined"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          type="submit"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};
