'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Alert,
  Button,
  MenuItem,
  TextField,
  FormLabel,
  Typography,
  FormControl,
  Autocomplete,
  ToggleButton,
  DialogActions,
  InputAdornment,
  ToggleButtonGroup,
} from '@mui/material';
import {
  employeePayrollApi,
  useGetEarningComponentsQuery,
  useAddEarningComponentMutation,
  useGetDeductionComponentsQuery,
  useDeleteEarningComponentMutation,
  useUpdateEarningComponentMutation,
} from 'src/redux/hr/employee-payroll-api';

import { SectionCard } from '../../employee/employee-form-fields/InformationFields';

interface PayElement {
  earningComponentName?: string;
  componentName?: string;
  earningType?: string;
  componentType?: string;
  id: string;
  description: string;
  isFixed?: boolean;
  amount: number;
  percentage?: number;
  visibleInPayslip: boolean;
  dependOn?: string;
  selectedEarningComponentId?: string;
  customComponentId?: string;
}

const EarningComponent = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const confirm = useBoolean();

  const [editData, setEditData] = useState<any>(null);
  const [deleteInformation, setDeleteInformation] = useState<PayElement | null>(null);
  const isEarningComponentOpen = useBoolean();

  const [deleteEarningComponent, { isLoading: deleteEarningComponentLoading }] =
    useQueryAndMutation({
      type: 'mutation',
      currentQueryAndMutation: useDeleteEarningComponentMutation,
    });

  const {
    data: getEarningComponentsData,
    isLoading: getEarningComponentsLoading,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEarningComponentsQuery,
    params: {
      academicYearId: currentYear?.id,
    },
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
      isEarningComponentOpen.onFalse();
      resetState();
    } else if (!isChanges) {
      isEarningComponentOpen.onFalse();
      setTimeout(() => {
        setEditData(null);
      }, 200);
    }
  };
  const { confirmWithUndo } = useConfirmWithUndo();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Earning Component"
        description="Manage the various earning components that make up employee salaries, including fixed and variable pay elements."
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Payroll Management', href: hrPaths.payroll.runPayroll },
          { name: 'Settings', href: hrPaths.payroll.settings.earningComponents },
          { name: 'Earning Component' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            size="small"
            onClick={isEarningComponentOpen.onTrue}
            sx={{ px: '32px' }}
          >
            Earning
          </Button>
        }
      />
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure you want to delete{' '}
            <b>{deleteInformation?.earningComponentName || deleteInformation?.componentName}</b>{' '}
            Earning Component?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={deleteEarningComponentLoading}
            onClick={async () => {
              confirmWithUndo({
                item: deleteInformation,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    employeePayrollApi.util.updateQueryData(
                      'getEarningComponents',
                      { academicYearId: currentYear?.id },
                      (draft: any) => {
                        const index = draft.items?.findIndex(
                          (b: any) => b.id === deleteInformation?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.items.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: (dispatchFn, index) => refetch(),
                onCommit: () => deleteEarningComponent(deleteInformation?.id || ''),
              });
              confirm.onFalse();
              setEditData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <CustomizableTable
        tableId="earning-component"
        isLoading={getEarningComponentsLoading}
        columns={[
          {
            id: 'earningComponentName',
            label: 'Name',
            align: 'left',
            minWidth: '20vw',
            sticky: true,
          },
          {
            id: 'earningType',
            label: 'Earning Type',
            align: 'left',
            minWidth: '10vw',
            filterType: 'enum',
            enumOptions: [
              { label: 'Fixed', value: 'Fixed' },
              { label: 'Variable', value: 'Variable' },
            ],
            render(value: string | boolean) {
              if (typeof value === 'boolean') {
                return value ? 'Fixed' : 'Variable';
              }
              return value || 'Fixed';
            },
          },
          {
            id: 'calculationType',
            label: 'Calculation Type',
            align: 'left',
            minWidth: '10vw',
            filterType: 'enum',
            enumOptions: [
              { label: 'Amount Based', value: 'Amount' },
              { label: 'Percentage Based', value: 'Percentage' },
            ],
          },
          {
            id: 'amount',
            label: 'Amount / Percentage',
            align: 'right',
            minWidth: '10vw',
            filterType: 'number',
            render(value, row) {
              if (row.calculationType === 'PERCENTAGE') {
                return (
                  <Typography variant="caption" fontSize="13px">
                    {row.percentage}%
                  </Typography>
                );
              }
              return (
                <Typography variant="caption" fontSize="13px">
                  {formatNumber(value, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'customComponent.componentName',
            label: 'Component Name',
            align: 'left',
            minWidth: '10vw',
            render(value: string) {
              return value || '-';
            },
          },
          { id: 'description', label: 'Description', align: 'left', minWidth: '20vw' },
          {
            id: 'visibleInPayslip',
            label: 'Visible In Payslip',
            align: 'left',
            minWidth: '10vw',
            filterType: 'enum',
            enumOptions: [
              { value: true, label: 'Yes' },
              { value: false, label: 'No' },
            ],
            render(value: boolean) {
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
                    isEarningComponentOpen.onTrue();
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
        data={getEarningComponentsData?.items || []}
      />
      <CustomDialog
        maxWidth="md"
        open={isEarningComponentOpen.value}
        handleClose={() => {
          isEarningComponentOpen.onFalse();
          setEditData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {editData ? 'Edit Earning Component' : 'Add Earning Component'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title={
                editData
                  ? `Edit ${editData.componentName} component settings including type, dependencies and visibility`
                  : 'Configure salary components like basic pay, allowances, and other earnings, including type, dependencies, and payslip visibility.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <EarningComponentForm editData={editData} handleClose={handleClose} />
      </CustomDialog>
    </Box>
  );
};

export default EarningComponent;

const earningTypes = ['Fixed', 'Variable'];
// Calculation Types constants
const calculationTypes = [
  { value: 'Amount', label: 'Amount Based' },
  { value: 'Percentage', label: 'Percentage Based' },
];

const validationSchema = Yup.object({
  earningName: Yup.string().required('Earning Name is required'),
  description: Yup.string(),
  earningType: Yup.string().required('Earning Type is required'),
  calculationType: Yup.string().required('Calculation Type is required'),
  selectedEarningComponent: Yup.string()
    .nullable()
    .when('calculationType', {
      is: 'Percentage',
      then: (schema) => schema.required('Select Component is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  amount: Yup.string()
    .test('required-if-fixed', 'Amount is required', function amountRequired(value) {
      const { earningType, calculationType } = this.parent;
      if (earningType === 'Variable') return true;

      // When earningType is Fixed
      if (value === undefined || value === null || value === '') {
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
        const { earningType, calculationType } = this.parent;
        if (earningType === 'Variable') return true;
        if (calculationType !== 'Percentage') return true;

        if (value === undefined || value === null || value === '') {
          return this.createError({ message: 'Percentage is required' });
        }

        const num = parseFloat(value);
        if (Number.isNaN(num)) return this.createError({ message: 'Invalid percentage' });
        if (num < 0) return this.createError({ message: 'Percentage must be at least 0' });
        if (num > 100) return this.createError({ message: 'Percentage must be at most 100' });
        return true;
      }
    ),
});

const EarningComponentForm = ({
  editData,
  handleClose,
}: {
  editData: any;
  handleClose: (e: any, isSubmit: boolean) => void;
}) => {
  const [addEarningComponent, { isLoading: addEarningComponentLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEarningComponentMutation,
  });
  const [updateEarningComponent, { isLoading: updateEarningComponentLoading }] =
    useQueryAndMutation({
      type: 'mutation',
      currentQueryAndMutation: useUpdateEarningComponentMutation,
    });
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const formik = useFormik({
    initialValues: {
      earningName: editData?.earningComponentName || editData?.componentName || '',
      description: editData?.description || '',
      earningType:
        editData?.earningType?.toLowerCase() === 'variable'
          ? 'Variable'
          : editData?.earningType?.toLowerCase() === 'fixed'
            ? 'Fixed'
            : editData && editData.isFixed !== undefined
              ? editData.isFixed
                ? 'Fixed'
                : 'Variable'
              : 'Fixed',
      calculationType:
        editData?.calculationType?.toLowerCase() === 'percentage'
          ? 'Percentage'
          : editData?.calculationType?.toLowerCase() === 'amount'
            ? 'Amount'
            : editData?.calculationType || editData?.componentType || '',
      selectedEarningComponent:
        editData?.selectedEarningComponentId || editData?.customComponentId || null,
      amount:
        editData?.calculationType?.toLowerCase() === 'percentage'
          ? editData?.percentage || ''
          : editData?.amount || '',
      showOnPayslip: editData?.visibleInPayslip ?? true,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          earningComponentName: values.earningName,
          description: values.description,
          earningType: values.earningType,
          calculationType: values.calculationType,
          amount:
            values.earningType === 'Fixed' && values.calculationType === 'Amount'
              ? Number(values.amount) || 0
              : 0,
          percentage:
            values.earningType === 'Fixed' && values.calculationType === 'Percentage'
              ? Number(values.amount) || 0
              : 0,
          selectedEarningComponentId:
            values.calculationType === 'Percentage' ? values.selectedEarningComponent : null,
          visibleInPayslip: values.showOnPayslip,
        };

        if (editData) {
          await updateEarningComponent({
            id: editData.id,
            body: payload,
          }).unwrap();
          shikshaMitraToast.success({ message: 'Earning Component updated successfully' });
        } else {
          await addEarningComponent({ body: payload }).unwrap();
          shikshaMitraToast.success({ message: 'Earning Component added successfully' });
        }
        handleClose(null, true);
      } catch (error) {
        console.error(error);
      }
    },
  });

  const { data: getEarningComponentsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEarningComponentsQuery,
    params: {
      academicYearId: currentYear?.id,
    },
  });

  const { data: getDeductionComponentsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDeductionComponentsQuery,
    params: {
      academicYearId: currentYear?.id,
    },
  });

  const componentOptions = React.useMemo(
    () => [
      ...(getEarningComponentsData?.items || []).map((item: any) => ({
        ...item,
        componentName: item.earningComponentName || item.componentName, // Map earningName to componentName for unification
        group: 'Earning Components',
      })),
      ...(getDeductionComponentsData?.items || []).map((item: any) => ({
        ...item,
        componentName: item.deductionName || item.componentName, // Map deductionName to componentName for unification
        group: 'Deduction Components',
      })),
    ],
    [getEarningComponentsData, getDeductionComponentsData]
  );

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        {/* Earning Details */}
        <SectionCard
          title="Earning Details"
          headerContent={
            <CustomTooltip
              arrow
              placement="right"
              title="Earning components define how employee salary is structured, such as Basic Pay or HRA."
            >
              <Iconify
                icon="lucide:info"
                sx={{ cursor: 'pointer' }}
                fontSize={16}
                color="info.main"
              />
            </CustomTooltip>
          }
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField
              error={formik.touched.earningName && Boolean(formik.errors.earningName)}
            >
              <TextField
                size="small"
                fullWidth
                label="Earning Name *"
                name="earningName"
                value={formik.values.earningName}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z0-9-_\s]/g, '');
                  formik.setFieldValue('earningName', value);
                }}
                error={formik.touched.earningName && Boolean(formik.errors.earningName)}
                helperText={(formik.touched.earningName && formik.errors.earningName) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField
              error={formik.touched.earningType && Boolean(formik.errors.earningType)}
            >
              <TextField
                size="small"
                select
                fullWidth
                label="Earning Type *"
                name="earningType"
                value={formik.values.earningType}
                onChange={(e) => {
                  formik.handleChange(e);
                  // Reset amount if switching to Variable
                  if (e.target.value === 'Variable') {
                    formik.setFieldValue('amount', '');
                  }
                }}
                error={formik.touched.earningType && Boolean(formik.errors.earningType)}
                helperText={(formik.touched.earningType && formik.errors.earningType) as string}
              >
                {earningTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 12 }}>
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
        </SectionCard>

        {/* Calculation Rules */}
        <SectionCard
          title="Calculation Rules"
          headerContent={
            <CustomTooltip
              arrow
              placement="right"
              title="Calculation rules define how the earning component is calculated, such as percentage of Basic Pay or a fixed amount."
            >
              <Iconify
                icon="lucide:info"
                sx={{ cursor: 'pointer' }}
                fontSize={16}
                color="info.main"
              />
            </CustomTooltip>
          }
        >
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
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
                  formik.setFieldValue('calculationType', e.target.value);
                  formik.setFieldValue('amount', '');
                }}
                error={formik.touched.calculationType && Boolean(formik.errors.calculationType)}
                helperText={
                  (formik.touched.calculationType && formik.errors.calculationType) as string
                }
              >
                {calculationTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </ShakingTextField>
          </Grid>

          {formik.values.calculationType === 'Percentage' && (
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <ShakingTextField
                error={
                  formik.touched.selectedEarningComponent &&
                  Boolean(formik.errors.selectedEarningComponent)
                }
              >
                <Autocomplete
                  options={componentOptions}
                  groupBy={(option) => option.group}
                  getOptionLabel={(option) => option.componentName}
                  filterOptions={(options) => options}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={
                    componentOptions.find(
                      (opt) => opt.id === formik.values.selectedEarningComponent
                    ) || null
                  }
                  onChange={(_, value) => {
                    formik.setFieldValue('selectedEarningComponent', value?.id || null);
                  }}
                  renderGroup={(params) => (
                    <Box key={params.key}>
                      {/* 🔹 Group Header */}
                      <Box
                        sx={{
                          px: 2,
                          pt: 1.2,
                          pb: 0.5,
                          fontWeight: 600,
                          fontSize: '14px',
                          color: 'text.primary',
                          backgroundColor: '#f5f5f5',
                        }}
                      >
                        {params.group}
                      </Box>

                      {/* 🔹 Group Items */}
                      <Box sx={{ pl: 2 }}>{params.children}</Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Component *"
                      size="small"
                      error={
                        formik.touched.selectedEarningComponent &&
                        Boolean(formik.errors.selectedEarningComponent)
                      }
                      helperText={
                        (formik.touched.selectedEarningComponent &&
                          formik.errors.selectedEarningComponent) as string
                      }
                    />
                  )}
                />
              </ShakingTextField>
            </Grid>
          )}

          {formik.values.earningType === 'Fixed' &&
            formik.values.calculationType === 'Percentage' && (
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <ShakingTextField error={formik.touched.amount && Boolean(formik.errors.amount)}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Percentage"
                    required={formik.values.earningType === 'Fixed'}
                    name="amount"
                    type="number"
                    value={formik.values.amount}
                    onChange={(e) => {
                      const { value } = e.target;

                      // Allow empty value
                      if (value === '') {
                        formik.setFieldValue('amount', value);
                        return;
                      }

                      const numericValue = Number(value);

                      // Restrict between 0 and 100
                      if (numericValue >= 0 && numericValue <= 100) {
                        formik.setFieldValue('amount', numericValue);
                      }
                    }}
                    inputProps={{
                      min: 0,
                      max: 100,
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                    helperText={(formik.touched.amount && formik.errors.amount) as string}
                  />
                </ShakingTextField>
              </Grid>
            )}
          {formik.values.earningType === 'Fixed' && formik.values.calculationType === 'Amount' && (
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <ShakingTextField error={formik.touched.amount && Boolean(formik.errors.amount)}>
                <NumericFormatCustom
                  size="small"
                  fullWidth
                  label="Amount *"
                  name="amount"
                  value={formik.values.amount || ''}
                  onChange={(e) => {
                    let val = e.target.value;
                    // Remove currency symbol and disallowed characters, but allow dots
                    val = val.replace(/[^0-9.]/g, '');

                    // Prevent multiple dots
                    const parts = val.split('.');
                    if (parts.length > 2) {
                      val = `${parts[0]}.${parts.slice(1).join('')}`;
                    }

                    // Convert to number and ensure it's positive
                    if (/^\d*\.?\d*$/.test(val)) {
                      formik.setFieldValue('amount', val); // keep it as string while typing
                    }
                  }}
                  sx={{
                    width: '100%',
                    padding: '0',
                    borderRadius: 1,
                  }}
                  error={!!(formik.touched.amount && formik.errors.amount)}
                  helperText={(formik.touched.amount && formik.errors.amount) as string}
                />
              </ShakingTextField>
            </Grid>
          )}
          <Grid size={{ xs: 12 }} display="flex">
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 0.5, fontSize: 13 }}>Payslip Visibility *</FormLabel>

              <Box display="flex" gap={1}>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={formik.values.showOnPayslip ? 'VISIBLE' : 'HIDDEN'}
                  onChange={(_, value) => {
                    if (value !== null) {
                      formik.setFieldValue('showOnPayslip', value === 'VISIBLE');
                    }
                  }}
                  sx={{ p: 0 }}
                >
                  <ToggleButton
                    value="VISIBLE"
                    sx={{
                      textTransform: 'none',
                      px: 1.5,
                      py: 0.5,
                      fontSize: 12,
                      gap: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'success.light',
                        color: 'success.dark',
                      },
                    }}
                  >
                    <Iconify icon="lucide:eye" fontSize={14} />
                    Visible
                  </ToggleButton>

                  <ToggleButton
                    value="HIDDEN"
                    sx={{
                      textTransform: 'none',
                      px: 1.5,
                      py: 0.5,
                      fontSize: 12,
                      gap: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'warning.light',
                        color: 'warning.dark',
                      },
                    }}
                  >
                    <Iconify icon="lucide:eye-off" fontSize={14} />
                    Internal
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </FormControl>
          </Grid>
        </SectionCard>
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              mt: 2,
              minHeight: 110, // slightly higher to handle all cases
              transition: 'opacity 0.2s ease',
            }}
          >
            <Alert icon={<Iconify icon="lucide:info" />} severity="info" variant="outlined">
              <Typography variant="body2">
                {/* 🔹 Main calculation explanation */}
                {formik.values.calculationType === 'Percentage' ? (
                  <>
                    This earning will be calculated as{' '}
                    <strong>{formik.values.amount || 'X'}%</strong> of{' '}
                    <strong>
                      {componentOptions.find((c) => c.id === formik.values.selectedEarningComponent)
                        ?.componentName || 'the selected component'}
                    </strong>
                    .
                    <br />
                    Example: If Basic Pay is ₹30,000 and percentage is 40%, this earning will be
                    ₹12,000.
                  </>
                ) : (
                  <>
                    This earning will be added as a fixed amount.
                    <strong>{formik.values.amount || 'X'}</strong>
                    <br />
                    Example: If amount is ₹5,000, the same amount will be applied to all employees.
                  </>
                )}
              </Typography>

              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {formik.values.earningType === 'Fixed'
                  ? 'The amount will be the same for all employees.'
                  : 'The amount can vary for each employee.'}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  visibility: formik.values.showOnPayslip ? 'hidden' : 'visible',
                }}
              >
                ⚠️ This earning will <strong>not</strong> appear on employee payslips.
              </Typography>
            </Alert>
          </Box>
        </Grid>
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
          loading={addEarningComponentLoading || updateEarningComponentLoading}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};
