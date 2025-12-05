'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
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

const DeductionComponent = () => {
  const confirm = useBoolean();
  const [editData, setEditData] = useState<any>(null);
  const [deleteInformation, setDeleteInformation] = useState<PayElement | null>(null);
  const isDeductionComponentOpen = useBoolean();

  const [deletePayElement] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeletePayElementMutation,
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Deduction Component"
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          {
            name: 'Payroll Management',
            href: '/hr/payroll/dashboard/',
          },
          { name: ' Settings' },
          { name: 'Deduction Component' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            size="small"
            onClick={isDeductionComponentOpen.onTrue}
            sx={{ px: '32px' }}
          >
            Deduction Component
          </Button>
        }
      />
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

const componentTypes = ['Fixed', 'Percentage'];
// Updated dependsOnOptions as requested
const dependsOnOptions = [
  'Basic Salary',
  'Gross Salary',
  'Net Salary',
  'CTC',
  'Allowances',
  'Any custom salary component',
];
// Sample custom salary components for the additional dropdown when last option selected
const customComponents = [
  'Overtime Pay',
  'Shift Allowance',
  'Leave Encashment',
  'Project Incentive',
  'Travel Reimbursement',
];

const validationSchema = Yup.object({
  componentName: Yup.string().required('Component Name is required'),
  description: Yup.string(),
  componentType: Yup.string().test(
    'required-if-fixed',
    'Component Type is required',
    function componentTypeRequired(value) {
      const { isFixed } = this.parent;
      return !isFixed || !!value;
    }
  ),
  dependOn: Yup.string().test(
    'required-if-percentage',
    'Depend On is required',
    function dependOnRequired(value) {
      const { isFixed, componentType } = this.parent;
      if (!isFixed) return true;
      if (componentType !== 'Percentage') return true;
      return !!value;
    }
  ),
  customComponent: Yup.string().test(
    'required-if-custom-depend',
    'Custom component is required',
    function customComponentRequired(value) {
      const { dependOn, isFixed, componentType } = this.parent;
      if (!isFixed) return true;
      if (componentType !== 'Percentage') return true;
      if (dependOn !== 'Any custom salary component') return true;
      return !!value;
    }
  ),
  amount: Yup.string().test(
    'required-if-fixed',
    'Amount is required',
    function amountRequired(value) {
      const { isFixed } = this.parent;
      return !isFixed || !!value;
    }
  ),
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
      description: editData?.description || '',
      componentType: editData?.componentType || '',
      dependOn: editData?.dependOn || '',
      customComponent: editData?.customComponent || '',
      amount: editData?.amount || '',
      visibleInPayslip: editData?.visibleInPayslip || true,
      isFixed: editData ? editData?.isFixed : true,
    },
    validationSchema,
    onSubmit: (values) => {
      handleClose();
    },
  });

  return (
    <>
      <DialogScrollContent>
        {/* General Information */}
        <SectionCard
          title="General Information"
          gridProps={{
            sx: {
              alignItems: 'start',
            },
          }}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField
              error={formik.touched.componentName && Boolean(formik.errors.componentName)}
            >
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
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField
              error={formik.touched.description && Boolean(formik.errors.description)}
            >
              <TextField
                size="small"
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={2}
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  name="isFixed"
                  checked={formik.values.isFixed}
                  onChange={(_e, value) => formik.setFieldValue('isFixed', value)}
                />
              }
              label="Is Fixed Component"
            />
          </Grid>
        </SectionCard>

        {/* Earning Configuration */}
        {formik.values.isFixed && (
          <SectionCard title="Earning Configuration">
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <ShakingTextField
                error={formik.touched.componentType && Boolean(formik.errors.componentType)}
              >
                <TextField
                  size="small"
                  select
                  fullWidth
                  label="Component Type *"
                  name="componentType"
                  value={formik.values.componentType}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (e.target.value !== 'Percentage') {
                      formik.setFieldValue('dependOn', '');
                      formik.setFieldValue('customComponent', '');
                    }
                  }}
                  error={formik.touched.componentType && Boolean(formik.errors.componentType)}
                  helperText={
                    (formik.touched.componentType && formik.errors.componentType) as string
                  }
                >
                  {componentTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </ShakingTextField>
            </Grid>

            {formik.values.componentType === 'Percentage' && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ShakingTextField
                  error={formik.touched.dependOn && Boolean(formik.errors.dependOn)}
                >
                  <TextField
                    size="small"
                    select
                    fullWidth
                    label="Depend on *"
                    name="dependOn"
                    value={formik.values.dependOn}
                    onChange={formik.handleChange}
                    error={formik.touched.dependOn && Boolean(formik.errors.dependOn)}
                    helperText={(formik.touched.dependOn && formik.errors.dependOn) as string}
                  >
                    {dependsOnOptions.map((dep) => (
                      <MenuItem key={dep} value={dep}>
                        {dep}
                      </MenuItem>
                    ))}
                  </TextField>
                </ShakingTextField>
              </Grid>
            )}

            {formik.values.componentType === 'Percentage' &&
              formik.values.dependOn === 'Any custom salary component' && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={formik.touched.customComponent && Boolean(formik.errors.customComponent)}
                  >
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Select Custom Component *"
                      name="customComponent"
                      value={formik.values.customComponent}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.customComponent && Boolean(formik.errors.customComponent)
                      }
                      helperText={
                        (formik.touched.customComponent && formik.errors.customComponent) as string
                      }
                    >
                      {customComponents.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </TextField>
                  </ShakingTextField>
                </Grid>
              )}

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <ShakingTextField error={formik.touched.amount && Boolean(formik.errors.amount)}>
                <TextField
                  size="small"
                  fullWidth
                  label={
                    formik.values.componentType === 'Percentage'
                      ? 'Amount Percentage *'
                      : 'Amount *'
                  }
                  name="amount"
                  type="number"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={(formik.touched.amount && formik.errors.amount) as string}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }} display="flex" alignItems="center">
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
          </SectionCard>
        )}
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
