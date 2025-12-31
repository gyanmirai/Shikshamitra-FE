'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
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
import {
  useGetDeductionComponentsQuery,
  useAddDeductionComponentMutation,
  useUpdateDeductionComponentMutation,
  useDeleteDeductionComponentMutation,
} from 'src/redux/employee-payroll/employee-payroll-api';

import { SectionCard } from '../../employee/employee-form-fields/InformationFields';

interface PayElement {
  deductionName: string;
  calculationType: string;
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
  showOnPayslip: boolean;
  isSameAmountForAll: boolean;
  calculatePercentageBasedOn: string;
  selectedDeductionComponent: string;
}

const DeductionComponent = () => {
  const confirm = useBoolean();
  const [editData, setEditData] = useState<any>(null);
  const [deleteInformation, setDeleteInformation] = useState<PayElement | null>(null);
  const isDeductionComponentOpen = useBoolean();

  const [deleteDeductionComponent, { isLoading: deleteDeductionComponentLoading }] =
    useQueryAndMutation({
      type: 'mutation',
      currentQueryAndMutation: useDeleteDeductionComponentMutation,
    });

  const { data: getDeductionComponentsData, isLoading: getDeductionComponentsLoading } =
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetDeductionComponentsQuery,
    });
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  // Handles closing the incident form
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        dispatch(setIsChanges(false));
      }, 200); // Adjust timing based on your dialog close animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      isDeductionComponentOpen.onFalse();
      resetState();
    } else if (!isChanges) {
      isDeductionComponentOpen.onFalse();
      setTimeout(() => {
        setEditData(null);
      }, 200);
    }
  };

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
        content={
          <>
            Are you sure you want to delete <b>{deleteInformation?.deductionName}</b> Deduction
            Component?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={deleteDeductionComponentLoading}
            onClick={async () => {
              await deleteDeductionComponent(deleteInformation?.id).unwrap();
              shikshaMitraToast.success({
                message: ` ${deleteInformation?.deductionName} Deduction Component deleted successfully`,
              });
              confirm.onFalse();
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <CustomizableTable
        tableId="earning-component"
        isLoading={getDeductionComponentsLoading}
        columns={[
          { id: 'deductionName', label: 'Name', align: 'left', minWidth: '10vw' },
          { id: 'description', label: 'Description', align: 'left', minWidth: '10vw' },
          { id: 'calculationType', label: 'Component Type', align: 'left', minWidth: '10vw' },
          {
            id: 'calculatePercentageBasedOn',
            label: 'Depends On',
            align: 'left',
            minWidth: '10vw',
          },
          { id: 'amount', label: 'Amount', align: 'left', minWidth: '10vw' },
          {
            id: 'showOnPayslip',
            label: 'Visible In Payslip',
            align: 'left',
            minWidth: '10vw',
            render(value, row) {
              return value ? 'Yes' : 'No';
            },
          },

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
        data={getDeductionComponentsData?.items || []}
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
                  ? `Edit ${editData.deductionName} deduction settings including type and calculation rules`
                  : 'Configure deduction components like PF, PT, TDS, LWF and ESI. Set calculation rules, percentages and eligibility criteria.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <DeductionComponentForm editData={editData} handleClose={handleClose} />
      </CustomDialog>
    </Box>
  );
};

export default DeductionComponent;

const componentTypes = ['Fixed', 'Percentage'];
// Updated dependsOnOptions as requested
const dependsOnOptions = ['GROSS', 'BASIC', 'CUSTOM_COMPONENT'];

const validationSchema = Yup.object({
  deductionName: Yup.string().required('Deduction Name is required'),
  description: Yup.string(),
  calculationType: Yup.string().test(
    'required-if-fixed',
    'Calculation Type is required',
    function calculationTypeRequired(value) {
      const { isSameAmountForAll } = this.parent;
      return !isSameAmountForAll || !!value;
    }
  ),
  calculatePercentageBasedOn: Yup.string().test(
    'required-if-percentage',
    'Calculate Percentage Based On is required',
    function calculatePercentageBasedOnRequired(value) {
      const { isSameAmountForAll, calculationType } = this.parent;
      if (!isSameAmountForAll) return true;
      if (calculationType !== 'Percentage') return true;
      return !!value;
    }
  ),
  selectedDeductionComponent: Yup.string()
    .test(
      'required-if-custom-depend',
      'Select Deduction Component is required',
      function selectedDeductionComponentRequired(value) {
        const { calculatePercentageBasedOn, isSameAmountForAll, calculationType } = this.parent;
        if (!isSameAmountForAll) return true;
        if (calculationType !== 'Percentage') return true;
        if (calculatePercentageBasedOn !== 'CUSTOM_COMPONENT') return true;
        return !!value;
      }
    )
    .nullable(),
  amount: Yup.string()
    .test('required-if-fixed', 'Amount is required', function amountRequired(value) {
      const { isSameAmountForAll, calculationType } = this.parent;
      if (!isSameAmountForAll) return true;
      if (!value) {
        if (calculationType === 'Percentage') {
          return this.createError({ message: 'Percentage is required' });
        }
        return this.createError({ message: 'Amount is required' });
      }
      return true;
    })
    .test(
      'percentage-range',
      'Percentage must be between 0 and 100',
      function percentageRange(value) {
        const { isSameAmountForAll, calculationType } = this.parent;
        if (!isSameAmountForAll) return true;
        if (calculationType !== 'Percentage') return true;
        if (!value) return true;

        const num = parseFloat(value);
        if (Number.isNaN(num)) return false;
        if (num <= 0) return this.createError({ message: 'Percentage must be at least 1' });
        if (num > 100) return this.createError({ message: 'Percentage must be at most 100' });
        return true;
      }
    ),
});

const DeductionComponentForm = ({
  editData,
  handleClose,
}: {
  editData: any;
  handleClose: (e: any, isSubmit: boolean) => void;
}) => {
  const { data: getDeductionComponentsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDeductionComponentsQuery,
  });
  const [addDeductionComponent, { isLoading: addDeductionComponentLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddDeductionComponentMutation,
  });
  const [updateDeductionComponent, { isLoading: updateDeductionComponentLoading }] =
    useQueryAndMutation({
      type: 'mutation',
      currentQueryAndMutation: useUpdateDeductionComponentMutation,
    });
  const formik = useFormik({
    initialValues: {
      deductionName: editData?.deductionName || '',
      description: editData?.description || '',
      calculationType: editData?.calculationType || '',
      calculatePercentageBasedOn: editData?.calculatePercentageBasedOn || '',
      selectedDeductionComponent: editData?.selectedDeductionComponent || '',
      amount: editData?.amount || '',
      showOnPayslip: editData?.showOnPayslip || true,
      isSameAmountForAll: editData ? editData?.isSameAmountForAll : true,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (editData) {
          await updateDeductionComponent({
            id: editData.id,
            body: {
              deductionName: values.deductionName,
              description: values.description,
              calculationType: values.calculationType,
              calculatePercentageBasedOn: values.calculatePercentageBasedOn,
              selectedDeductionComponent: values.selectedDeductionComponent,
              amount: values.amount,
              showOnPayslip: values.showOnPayslip,
              isSameAmountForAll: values.isSameAmountForAll,
            },
          }).unwrap();
        } else {
          await addDeductionComponent({
            deductionName: values.deductionName,
            description: values.description,
            calculationType: values.calculationType,
            calculatePercentageBasedOn: values.calculatePercentageBasedOn,
            selectedDeductionComponent: values.selectedDeductionComponent,
            amount: values.amount,
            showOnPayslip: values.showOnPayslip,
            isSameAmountForAll: values.isSameAmountForAll,
          }).unwrap();
        }
        handleClose(null, true);
      } catch (error) {
        console.error(error);
      }
    },
  });
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        {/* Deduction Details */}
        <SectionCard
          title="Deduction Details"
          gridProps={{
            sx: {
              alignItems: 'start',
            },
          }}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField
              error={formik.touched.deductionName && Boolean(formik.errors.deductionName)}
            >
              <TextField
                size="small"
                fullWidth
                label="Deduction Name *"
                name="deductionName"
                value={formik.values.deductionName}
                onChange={formik.handleChange}
                error={formik.touched.deductionName && Boolean(formik.errors.deductionName)}
                helperText={(formik.touched.deductionName && formik.errors.deductionName) as string}
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
                  name="isSameAmountForAll"
                  checked={formik.values.isSameAmountForAll}
                  onChange={(_e, value) => formik.setFieldValue('isSameAmountForAll', value)}
                />
              }
              label="Same Amount for All Employees"
            />
          </Grid>
        </SectionCard>

        {/* Earning Configuration */}
        {formik.values.isSameAmountForAll && (
          <SectionCard title="Calculation Rules">
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <ShakingTextField
                error={formik.touched.calculationType && Boolean(formik.errors.calculationType)}
              >
                <TextField
                  size="small"
                  select
                  fullWidth
                  label="Calculation Type *"
                  name="calculationType"
                  value={formik.values.calculationType}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (e.target.value !== 'Percentage') {
                      formik.setFieldValue('calculatePercentageBasedOn', '');
                      formik.setFieldValue('selectedDeductionComponent', '');
                    }
                    formik.setFieldTouched('calculationType', false);
                  }}
                  error={formik.touched.calculationType && Boolean(formik.errors.calculationType)}
                  helperText={
                    (formik.touched.calculationType && formik.errors.calculationType) as string
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

            {formik.values.calculationType === 'Percentage' && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ShakingTextField
                  error={
                    formik.touched.calculatePercentageBasedOn &&
                    Boolean(formik.errors.calculatePercentageBasedOn)
                  }
                >
                  <TextField
                    size="small"
                    select
                    fullWidth
                    label="Calculate Percentage Based On *"
                    name="calculatePercentageBasedOn"
                    value={formik.values.calculatePercentageBasedOn}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.calculatePercentageBasedOn &&
                      Boolean(formik.errors.calculatePercentageBasedOn)
                    }
                    helperText={
                      (formik.touched.calculatePercentageBasedOn &&
                        formik.errors.calculatePercentageBasedOn) as string
                    }
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

            {formik.values.calculationType === 'Percentage' &&
              formik.values.calculatePercentageBasedOn === 'CUSTOM_COMPONENT' && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={
                      formik.touched.selectedDeductionComponent &&
                      Boolean(formik.errors.selectedDeductionComponent)
                    }
                  >
                    <CustomSelect
                      options={getDeductionComponentsData?.items || []}
                      label="Select Deduction Component *"
                      value={formik.values.selectedDeductionComponent}
                      onChange={(val) => {
                        formik.setFieldValue('selectedDeductionComponent', val);
                      }}
                      labelKey="componentName"
                      valueKey="id"
                      error={
                        formik.touched.selectedDeductionComponent &&
                        Boolean(formik.errors.selectedDeductionComponent)
                      }
                      helperText={
                        (formik.touched.selectedDeductionComponent &&
                          formik.errors.selectedDeductionComponent) as string
                      }
                      fullWidth
                    />
                  </ShakingTextField>
                </Grid>
              )}

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <ShakingTextField error={formik.touched.amount && Boolean(formik.errors.amount)}>
                <TextField
                  size="small"
                  fullWidth
                  label={
                    formik.values.calculationType === 'Percentage' ? 'Percentage *' : 'Amount *'
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
                    name="showOnPayslip"
                    checked={formik.values.showOnPayslip}
                    onChange={formik.handleChange}
                  />
                }
                label="Show on Payslip"
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
          onClick={(e: any) => handleClose(e, false)}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          type="submit"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          onClick={(e: any) => formik.handleSubmit(e)}
          loading={addDeductionComponentLoading || updateDeductionComponentLoading}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};
