import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useBoolean, type UseBooleanReturn } from 'src/hooks/use-boolean';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useDeletePayElementMutation } from 'src/redux/payElement/payElementApi';
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

import { SectionCard } from '../../employee/employee-form-fields/InformationFields';

interface PayElement {
  name: string;
  componentType: string;
  id: string;
  description: string;
  isEmployeeSpecific: boolean;
  isDependent: boolean;
  dependName: string;
  dependent: {
    amount: number;
    percentage: boolean;
    elementCode: string;
  };
  amount: number;
  amountOfPercentage: number;
  isVisibleInPaySlip: boolean;
}

const DeductionComponent = ({
  isDeductionComponentOpen,
}: {
  isDeductionComponentOpen: UseBooleanReturn;
}) => {
  const confirm = useBoolean();
  const [editData, setEditData] = useState<any>(null);
  const [deleteInformation, setDeleteInformation] = useState<PayElement | null>(null);

  const [deletePayElement] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeletePayElementMutation,
  });

  return (
    <Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              await deletePayElement(deleteInformation?.id);
              confirm.onFalse();
            }}
          >
            Yes
          </Button>
        }
      />
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
                  handleDeleteClick={() => {
                    setDeleteInformation(row as PayElement);
                    confirm.onTrue();
                  }}
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
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {editData ? 'Edit Deduction Component' : 'Add Deduction Component'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title={
                editData
                  ? `Edit ${editData.name} deduction settings including type and calculation rules`
                  : 'Configure deduction components like PF, PT, TDS, LWF and ESI. Set calculation rules, percentages and eligibility criteria.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
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
  componentName: Yup.string().required('Component Name is required'),
  componentType: Yup.string().required('Component Type is required'),
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
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                size="small"
                fullWidth
                label="Component Name *"
                name="componentName"
                value={formik.values.componentName}
                onChange={formik.handleChange}
                error={formik.touched.componentName && Boolean(formik.errors.componentName)}
                helperText={(formik.touched.componentName && formik.errors.componentName) as string}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                size="small"
                select
                fullWidth
                label="Component Type *"
                name="componentType"
                value={formik.values.componentType}
                onChange={formik.handleChange}
                error={formik.touched.componentType && Boolean(formik.errors.componentType)}
                helperText={(formik.touched.componentType && formik.errors.componentType) as string}
              >
                {['Deduction', 'Tax', 'Other'].map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
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
          </Grid>
        </SectionCard>

        {/* Deduction Configuration */}
        <SectionCard title="Deduction Configuration">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2">For Provident Fund (PF)</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                size="small"
                label="Employee Percentage"
                name="employeePercentage"
                fullWidth
                value={formik.values.employeePercentage}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                size="small"
                label="Employer Percentage"
                name="employerPercentage"
                fullWidth
                value={formik.values.employerPercentage}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
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

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2">For Professional Tax (PT)</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }} sx={{ pt: '8px !important' }}>
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
            <Grid size={{ xs: 6, sm: 3 }} sx={{ pt: '8px !important' }}>
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
            <Grid size={{ xs: 6, sm: 3 }} sx={{ pt: '8px !important' }}>
              <TextField
                size="small"
                label="To Salary"
                name="ptToSalary"
                fullWidth
                value={formik.values.ptToSalary}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }} sx={{ pt: '8px !important' }}>
              <TextField
                size="small"
                label="Tax Amount"
                name="ptTaxAmount"
                fullWidth
                value={formik.values.ptTaxAmount}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2">For Tax Deducted at Source (TDS)</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }} sx={{ pt: '8px !important' }}>
              <TextField
                size="small"
                label="From Salary"
                name="tdsFromSalary"
                fullWidth
                value={formik.values.tdsFromSalary}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }} sx={{ pt: '8px !important' }}>
              <TextField
                size="small"
                label="To Salary"
                name="tdsToSalary"
                fullWidth
                value={formik.values.tdsToSalary}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ pt: '8px !important' }}>
              <TextField
                size="small"
                label="TDS Amount/Percentage"
                name="tdsAmount"
                fullWidth
                value={formik.values.tdsAmount}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2">For Labour Welfare Fund (LWF)</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }} sx={{ pt: '8px !important' }}>
              <TextField
                size="small"
                label="Employee Contribution"
                name="lwfEmployee"
                fullWidth
                value={formik.values.lwfEmployee}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }} sx={{ pt: '8px !important' }}>
              <TextField
                size="small"
                label="Employer Contribution"
                name="lwfEmployer"
                fullWidth
                value={formik.values.lwfEmployer}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ pt: '8px !important' }}>
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

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2">For Employee State Insurance (ESI)</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }} sx={{ pt: '8px !important' }}>
              <TextField
                size="small"
                label="Employee Contribution"
                name="esiEmployee"
                fullWidth
                value={formik.values.esiEmployee}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }} sx={{ pt: '8px !important' }}>
              <TextField
                size="small"
                label="Employer Contribution"
                name="esiEmployer"
                fullWidth
                value={formik.values.esiEmployer}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ pt: '8px !important' }}>
              <TextField
                size="small"
                label="ESI Eligibility Salary Cap"
                name="esiCap"
                fullWidth
                value={formik.values.esiCap}
                onChange={formik.handleChange}
              />
            </Grid>
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
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </>
  );
};
