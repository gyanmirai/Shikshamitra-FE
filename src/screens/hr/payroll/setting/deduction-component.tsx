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
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { HrNotice, HrLoadingNotice } from 'src/screens/hr/components/hr-notice';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Alert,
  Button,
  Dialog,
  MenuItem,
  FormLabel,
  TextField,
  Typography,
  DialogTitle,
  FormControl,
  Autocomplete,
  ToggleButton,
  DialogActions,
  DialogContent,
  InputAdornment,
  DialogContentText,
  ToggleButtonGroup,
} from '@mui/material';
import {
  useGetEarningComponentsQuery,
  useGetDeductionComponentsQuery,
  useAddDeductionComponentMutation,
  useUpdateDeductionComponentMutation,
  useDeleteDeductionComponentMutation,
  usePreviewDeductionComponentDeleteImpactQuery,
  usePreviewDeductionComponentUpdateImpactMutation,
} from 'src/redux/hr/employee-payroll-api';

import { grossSalaryOption, getCalculationBase } from './payroll-calculation-base';
import { SectionCard } from '../../employee/employee-form-fields/InformationFields';

interface PayElement {
  deductionComponentName?: string;
  deductionName?: string;
  deductionType?: string;
  calculationType: string;
  id: string;
  description: string;
  isSameAmountForAll?: boolean;
  amount: number;
  percentage?: number;
  visibleInPayslip?: boolean;
  showOnPayslip?: boolean;
  selectedDeductionComponent?: string;
  selectedDeductionComponentId?: string;
}

const DeductionComponent = () => {
  const [tableQuery, setTableQuery] = useState({ page: 1, pageSize: 20, search: '' });
  const exportTable = useHrTableExport('hr-deduction-components', tableQuery);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const confirm = useBoolean();
  const [editData, setEditData] = useState<any>(null);
  const [deleteInformation, setDeleteInformation] = useState<PayElement | null>(null);
  const isDeductionComponentOpen = useBoolean();

  const [deleteDeductionComponent, { isLoading: deleteDeductionComponentLoading }] =
    useQueryAndMutation({
      type: 'mutation',
      currentQueryAndMutation: useDeleteDeductionComponentMutation,
    });
  const {
    data: deleteImpactPreview,
    isFetching: deleteImpactPreviewLoading,
    isError: deleteImpactPreviewError,
    refetch: refetchDeleteImpactPreview,
  } = usePreviewDeductionComponentDeleteImpactQuery(
    { id: deleteInformation?.id || '', includeEmployees: true, maxResultCount: 5 },
    { skip: !confirm.value || !deleteInformation?.id }
  );

  const {
    data: getDeductionComponentsData,
    isLoading: getDeductionComponentsLoading,
    refetch,
    error: tableError,
    isFetching: tableFetching,
    tableProps: operationalTableProps,
  } = useHrTableQuery(
    {
      table: 'hr-deduction-components',
      query: tableQuery,
      page: tableQuery.page - 1,
      size: tableQuery.pageSize,
      resetPage: () => setTableQuery((current) => ({ ...current, page: 1 })),
    },
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetDeductionComponentsQuery,
      params: {
        academicYearId: currentYear?.id,
        ...tableQuery,
      },
    })
  );
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
        description="Manage the various deduction components that are subtracted from staff salaries, including fixed and variable deductions."
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Payroll Management', href: hrPaths.payroll.runPayroll },
          { name: 'Settings', href: hrPaths.payroll.settings.deductionComponents },
          { name: 'Deduction Component' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            size="small"
            onClick={isDeductionComponentOpen.onTrue}
          >
            Add deduction
          </Button>
        }
      />
      <Dialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
          setDeleteInformation(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Deduction Component</DialogTitle>
        <DialogContent>
          {deleteImpactPreviewLoading ? (
            <HrLoadingNotice>Loading payroll impact...</HrLoadingNotice>
          ) : deleteImpactPreviewError ? (
            <Alert
              severity="error"
              action={
                <Button size="small" color="inherit" onClick={() => refetchDeleteImpactPreview()}>
                  Retry
                </Button>
              }
            >
              Unable to load payroll impact. Please retry before deleting this component.
            </Alert>
          ) : deleteImpactPreview?.previewHash ? (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                This component is linked to {deleteImpactPreview.linkedEmployeeCount} staff payroll
                profiles. It will be removed from staff payroll profiles going forward. Finalized
                salary slips will not change. Draft salary slips will update only after
                regeneration.
              </DialogContentText>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 1.5,
                }}
              >
                <HrNotice severity="info">
                  Synced staff: {deleteImpactPreview?.syncedEmployeeCount ?? 0}
                </HrNotice>
                <Alert severity="warning">
                  Manual overrides: {deleteImpactPreview?.manualOverrideEmployeeCount ?? 0}
                </Alert>
                <Alert severity="success">
                  Draft slips: {deleteImpactPreview?.draftSlipCount ?? 0}
                </Alert>
                <Alert severity="error">
                  Finalized slips: {deleteImpactPreview?.finalizedSlipCount ?? 0}
                </Alert>
              </Box>
            </>
          ) : (
            <HrNotice severity="info">Payroll impact is not loaded yet.</HrNotice>
          )}
          {!!deleteImpactPreview?.previewHash && !!deleteImpactPreview?.syncedEmployees?.length && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Sample linked staff:{' '}
              {deleteImpactPreview.syncedEmployees
                .map((employee: any) => employee.employeeName)
                .join(', ')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={() => {
              confirm.onFalse();
              setDeleteInformation(null);
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={deleteDeductionComponentLoading || deleteImpactPreviewLoading}
            disabled={!deleteImpactPreview?.previewHash || deleteImpactPreviewError}
            onClick={async () => {
              await deleteDeductionComponent({
                id: deleteInformation?.id || '',
                previewHash: deleteImpactPreview?.previewHash,
              }).unwrap();
              shikshaMitraToast.success({ message: 'Deduction Component deleted successfully' });
              confirm.onFalse();
              setDeleteInformation(null);
              setEditData(null);
              refetch();
            }}
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <CustomizableTable
        showColumns
        showExport
        showFullScreen
        exportScope="all"
        tableId="hr-deduction-components"
        tableTitle="Deduction components"
        onExport={exportTable}
        error={tableError}
        onRetry={refetch}
        serverSidePagination
        serverSideSearch
        page={tableQuery.page - 1}
        rowsPerPage={tableQuery.pageSize}
        totalCount={getDeductionComponentsData?.totalCount || 0}
        onServerPagination={(page, pageSize) =>
          setTableQuery((current) => ({ ...current, page, pageSize }))
        }
        onServerSearch={(search) => setTableQuery((current) => ({ ...current, page: 1, search }))}
        isLoading={getDeductionComponentsLoading || tableFetching}
        searchTerm={tableQuery.search}
        columns={[
          {
            id: 'deductionComponentName',
            label: 'Name',
            align: 'left',
            minWidth: '20vw',
            sticky: true,
          },
          {
            id: 'deductionType',
            label: 'Deduction Type',
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
            label: 'Calculation base',
            align: 'left',
            minWidth: '10vw',
            render(value: string, row: any) {
              return row?.calculationBase === 'GROSS' ? 'Gross Salary' : value || '-';
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
            stickyPosition: 'right' as const,
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
        {...operationalTableProps}
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

const deductionTypes = ['Fixed', 'Variable'];
// Calculation Types constants
const calculationTypes = [
  { value: 'Amount', label: 'Amount Based' },
  { value: 'Percentage', label: 'Percentage Based' },
];

const validationSchema = Yup.object({
  deductionName: Yup.string().required('Deduction Name is required'),
  description: Yup.string(),
  deductionType: Yup.string().required('Deduction Type is required'),
  calculationType: Yup.string().required('Calculation Type is required'),
  selectedDeductionComponent: Yup.string()
    .nullable()
    .when('calculationType', {
      is: 'Percentage',
      then: (schema) => schema.required('Calculation base is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  amount: Yup.string()
    .test('required-if-fixed', 'Amount is required', function amountRequired(value) {
      const { deductionType, calculationType } = this.parent;
      if (deductionType === 'Variable') return true;

      // When deductionType is Fixed
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
        const { deductionType, calculationType } = this.parent;
        if (deductionType === 'Variable') return true;
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

const DeductionComponentForm = ({
  editData,
  handleClose,
}: {
  editData: any;
  handleClose: (e: any, isSubmit: boolean) => void;
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

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

  const [addDeductionComponent, { isLoading: addDeductionComponentLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddDeductionComponentMutation,
  });

  const [updateDeductionComponent, { isLoading: updateDeductionComponentLoading }] =
    useQueryAndMutation({
      type: 'mutation',
      currentQueryAndMutation: useUpdateDeductionComponentMutation,
    });
  const [previewUpdateImpact, { isLoading: previewUpdateImpactLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePreviewDeductionComponentUpdateImpactMutation,
  });
  const [impactPreview, setImpactPreview] = useState<any>(null);
  const [pendingPayload, setPendingPayload] = useState<any>(null);

  const formik = useFormik({
    initialValues: {
      deductionName: editData?.deductionComponentName || editData?.deductionName || '',
      description: editData?.description || '',
      deductionType: editData?.deductionType
        ? editData.deductionType.charAt(0).toUpperCase() +
          editData.deductionType.slice(1).toLowerCase()
        : editData && editData.isSameAmountForAll !== undefined
          ? editData.isSameAmountForAll
            ? 'Fixed'
            : 'Variable'
          : 'Fixed',
      calculationType: editData?.calculationType
        ? editData.calculationType.charAt(0).toUpperCase() +
          editData.calculationType.slice(1).toLowerCase()
        : '',
      selectedDeductionComponent:
        editData?.calculationBase === 'GROSS'
          ? grossSalaryOption.id
          : editData?.selectedDeductionComponentId || editData?.selectedDeductionComponent || null,
      amount:
        editData?.calculationType?.toUpperCase() === 'PERCENTAGE'
          ? (editData?.percentage ?? '')
          : (editData?.amount ?? ''),
      showOnPayslip: editData?.visibleInPayslip ?? editData?.showOnPayslip ?? true,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          deductionComponentName: values.deductionName,
          description: values.description,
          deductionType: values.deductionType,
          calculationType: values.calculationType,
          amount:
            values.deductionType === 'Fixed' && values.calculationType === 'Amount'
              ? Number(values.amount) || 0
              : 0,
          percentage:
            values.deductionType === 'Fixed' && values.calculationType === 'Percentage'
              ? Number(values.amount) || 0
              : 0,
          calculationBase: getCalculationBase(
            values.calculationType,
            values.selectedDeductionComponent
          ).calculationBase,
          selectedDeductionComponentId: getCalculationBase(
            values.calculationType,
            values.selectedDeductionComponent
          ).componentId,
          visibleInPayslip: values.showOnPayslip,
        };

        if (editData) {
          const preview = await previewUpdateImpact({
            id: editData.id,
            body: payload,
          }).unwrap();
          setPendingPayload(payload);
          setImpactPreview(preview);
        } else {
          await addDeductionComponent({
            body: payload,
          }).unwrap();
          shikshaMitraToast.success({ message: 'Deduction Component added successfully' });
          handleClose(null, true);
        }
      } catch (error) {
        console.error(error);
      }
    },
  });

  const confirmUpdate = async (applyMode: 'SyncedOnly' | 'ForceApply') => {
    if (!editData || !pendingPayload || !impactPreview) return;

    await updateDeductionComponent({
      id: editData.id,
      body: {
        ...pendingPayload,
        applyMode,
        effectiveMonth: impactPreview.effectiveMonth,
        previewHash: impactPreview.previewHash,
      },
    }).unwrap();
    setImpactPreview(null);
    setPendingPayload(null);
    shikshaMitraToast.success({ message: 'Deduction Component updated successfully' });
    handleClose(null, true);
  };

  const componentOptions = React.useMemo(() => {
    const options = [
      ...(getEarningComponentsData?.items || []).map((item: any) => ({
        ...item,
        componentName: item.earningComponentName || item.componentName || 'Unnamed Earning',
        group: 'Earning Components',
      })),
      ...(getDeductionComponentsData?.items || []).map((item: any) => ({
        ...item,
        componentName:
          item.deductionComponentName ||
          item.deductionName ||
          item.componentName ||
          'Unnamed Deduction',
        group: 'Deduction Components',
      })),
    ];

    if (
      editData?.selectedDeductionComponentId &&
      editData?.customComponent?.componentName &&
      !options.some((item: any) => item.id === editData.selectedDeductionComponentId)
    ) {
      options.push({
        id: editData.selectedDeductionComponentId,
        componentName: editData.customComponent.componentName,
        group:
          editData.customComponent.componentOf === 'EARNING_COMPONENT'
            ? 'Earning Components'
            : 'Deduction Components',
      });
    }

    return options;
  }, [editData, getEarningComponentsData, getDeductionComponentsData]);

  return (
    <>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <DialogScrollContent>
          {/* Deduction Details */}
          <SectionCard
            title="Deduction Details"
            headerContent={
              <CustomTooltip
                arrow
                placement="right"
                title="Deduction components define how amount is deducted from staff salary, such as PF or Tax."
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
                error={formik.touched.deductionName && Boolean(formik.errors.deductionName)}
              >
                <TextField
                  size="small"
                  fullWidth
                  label="Deduction Name *"
                  name="deductionName"
                  value={formik.values.deductionName}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z0-9-_\s]/g, '');
                    formik.setFieldValue('deductionName', value);
                  }}
                  error={formik.touched.deductionName && Boolean(formik.errors.deductionName)}
                  helperText={
                    (formik.touched.deductionName && formik.errors.deductionName) as string
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <ShakingTextField
                error={formik.touched.deductionType && Boolean(formik.errors.deductionType)}
              >
                <TextField
                  size="small"
                  select
                  fullWidth
                  label="Deduction Type *"
                  name="deductionType"
                  value={formik.values.deductionType}
                  onChange={(e) => {
                    formik.handleChange(e);
                    // Reset amount if switching to Variable
                    if (e.target.value === 'Variable') {
                      formik.setFieldValue('amount', '');
                    }
                  }}
                  error={formik.touched.deductionType && Boolean(formik.errors.deductionType)}
                  helperText={
                    (formik.touched.deductionType && formik.errors.deductionType) as string
                  }
                >
                  {deductionTypes.map((type) => (
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
                title="Calculation rules define how the deduction is calculated, such as percentage of Basic Pay or a fixed amount."
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
                    formik.touched.selectedDeductionComponent &&
                    Boolean(formik.errors.selectedDeductionComponent)
                  }
                >
                  <Autocomplete
                    options={[grossSalaryOption, ...componentOptions]}
                    groupBy={(option) => option.group}
                    getOptionLabel={(option) => option.componentName}
                    filterOptions={(options) => options}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value={
                      [grossSalaryOption, ...componentOptions].find(
                        (opt) => opt.id === formik.values.selectedDeductionComponent
                      ) || null
                    }
                    onChange={(_, value) => {
                      formik.setFieldValue('selectedDeductionComponent', value?.id || null);
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
                        label="Calculation base *"
                        size="small"
                        error={
                          formik.touched.selectedDeductionComponent &&
                          Boolean(formik.errors.selectedDeductionComponent)
                        }
                        helperText={
                          (formik.touched.selectedDeductionComponent &&
                            formik.errors.selectedDeductionComponent) as string
                        }
                      />
                    )}
                  />
                </ShakingTextField>
              </Grid>
            )}

            {formik.values.deductionType === 'Fixed' &&
              formik.values.calculationType === 'Percentage' && (
                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                  <ShakingTextField error={formik.touched.amount && Boolean(formik.errors.amount)}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Percentage"
                      required={formik.values.deductionType === 'Fixed'}
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
            {formik.values.deductionType === 'Fixed' &&
              formik.values.calculationType === 'Amount' && (
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

            <Grid size={{ xs: 12 }} display="flex" alignItems="center">
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
              <HrNotice icon={<Iconify icon="lucide:info" />} severity="info" variant="outlined">
                <Typography variant="body2">
                  {/* 🔹 Main calculation explanation */}
                  {formik.values.calculationType === 'Percentage' ? (
                    <>
                      This deduction will be calculated as{' '}
                      <strong>{formik.values.amount || 'X'}%</strong> of{' '}
                      <strong>
                        {[grossSalaryOption, ...componentOptions].find(
                          (c) => c.id === formik.values.selectedDeductionComponent
                        )?.componentName || 'the selected component'}
                      </strong>
                      .
                      <br />
                      Example: If Basic Pay is ₹30,000 and percentage is 10%, this deduction will be
                      ₹3,000.
                    </>
                  ) : (
                    <>
                      This deduction will be added as a fixed amount.
                      <strong>{formik.values.amount || 'X'}</strong>
                      <br />
                      Example: If amount is ₹2,000, the same deduction will be applied to all staff.
                    </>
                  )}
                </Typography>

                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {formik.values.deductionType === 'Fixed'
                    ? formik.values.calculationType === 'Percentage'
                      ? 'The percentage is fixed; the amount follows the calculation base.'
                      : 'The configured amount is fixed.'
                    : 'The amount can vary for each staff.'}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    visibility: formik.values.showOnPayslip ? 'hidden' : 'visible',
                  }}
                >
                  ⚠️ This deduction will <strong>not</strong> appear on staff payslips.
                </Typography>
              </HrNotice>
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
            loading={
              addDeductionComponentLoading ||
              updateDeductionComponentLoading ||
              previewUpdateImpactLoading
            }
          >
            {editData ? 'Update' : 'Submit'}
          </LoadingButton>
        </DialogActions>
      </BackPopUpChecked>
      <Dialog
        open={Boolean(impactPreview)}
        onClose={() => setImpactPreview(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Payroll Impact Preview</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 1.5,
              my: 1,
            }}
          >
            <HrNotice severity="info">Synced staff: {impactPreview?.syncedEmployeeCount ?? 0}</HrNotice>
            <Alert severity="warning">
              Manual overrides: {impactPreview?.manualOverrideEmployeeCount ?? 0}
            </Alert>
            <Alert severity="success">Draft slips: {impactPreview?.draftSlipCount ?? 0}</Alert>
            <Alert severity="error">
              Finalized slips: {impactPreview?.finalizedSlipCount ?? 0}
            </Alert>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Effective month: {impactPreview?.effectiveMonth}. Normal save updates only staff still
            following the master value. Force apply overwrites manual staff overrides for this
            component and makes them follow the master again.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:arrow-left" />}
            onClick={() => setImpactPreview(null)}
          >
            Review
          </Button>
          <LoadingButton
            size="small"
            loading={updateDeductionComponentLoading}
            variant="outlined"
            startIcon={<Iconify icon="mdi:content-save-outline" />}
            onClick={() => confirmUpdate('SyncedOnly')}
          >
            Save synced only
          </LoadingButton>
          <LoadingButton
            size="small"
            color="warning"
            startIcon={<Iconify icon="mdi:content-save-all-outline" />}
            variant="contained"
            loading={updateDeductionComponentLoading}
            onClick={() => confirmUpdate('ForceApply')}
          >
            Force apply
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
