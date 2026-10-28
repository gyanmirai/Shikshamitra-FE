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
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { HrNotice, HrLoadingNotice } from 'src/screens/hr/components/hr-notice';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useGetEarningComponentsQuery,
  useAddEarningComponentMutation,
  useDeleteEarningComponentMutation,
  useUpdateEarningComponentMutation,
  usePreviewEarningComponentDeleteImpactQuery,
  usePreviewEarningComponentUpdateImpactMutation,
} from 'src/redux/hr/employee-payroll-api';
import {
  Box,
  Grid,
  Alert,
  Button,
  Dialog,
  MenuItem,
  MenuList,
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

import { EarningEsiTreatmentDialog } from './earning-esi-treatment-dialog';
import { grossSalaryOption, getCalculationBase } from './payroll-calculation-base';
import {
  isEarningComponentDependencyError,
  getEligibleEarningDependencyOptions,
} from './earning-component-dependency-options';

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
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canViewEsi = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.statutorySchemes
  );
  const [esiComponent, setEsiComponent] = useState<{ id: string; name: string } | 'all' | null>(
    null
  );
  const [tableQuery, setTableQuery] = useState({ page: 1, pageSize: 20, search: '' });
  const exportTable = useHrTableExport('hr-earning-components', tableQuery);
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
    data: deleteImpactPreview,
    isFetching: deleteImpactPreviewLoading,
    isError: deleteImpactPreviewError,
    refetch: refetchDeleteImpactPreview,
  } = usePreviewEarningComponentDeleteImpactQuery(
    { id: deleteInformation?.id || '', includeEmployees: true, maxResultCount: 5 },
    { skip: !confirm.value || !deleteInformation?.id }
  );

  const {
    data: getEarningComponentsData,
    isLoading: getEarningComponentsLoading,
    refetch,
    error: tableError,
    isFetching: tableFetching,
    tableProps: operationalTableProps,
  } = useHrTableQuery(
    {
      table: 'hr-earning-components',
      query: tableQuery,
      page: tableQuery.page - 1,
      size: tableQuery.pageSize,
      resetPage: () => setTableQuery((current) => ({ ...current, page: 1 })),
    },
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetEarningComponentsQuery,
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
      isEarningComponentOpen.onFalse();
      resetState();
    } else if (!isChanges) {
      isEarningComponentOpen.onFalse();
      setTimeout(() => {
        setEditData(null);
      }, 200);
    }
  };
  return (
    <Box sx={{ height: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        sx={{ flexShrink: 0 }}
        slotProps={{
          heading: {},
          moreLink: {},
          breadcrumbs: {},
          action: { alignSelf: { xs: 'flex-end', md: 'center' } },
        }}
        heading="Earning Component"
        description="Manage the various earning components that make up staff salaries, including fixed and variable pay elements."
        links={[
          { name: 'Payroll Management', href: hrPaths.payroll.root },
          { name: 'Earning Component' },
        ]}
        action={
          <Box display="flex" gap={1} flexWrap="wrap">
            {canViewEsi && (
              <Button size="small" onClick={() => setEsiComponent('all')}>
                ESIC treatment
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<Add />}
              size="small"
              onClick={isEarningComponentOpen.onTrue}
            >
              Add earning
            </Button>
          </Box>
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
        <DialogTitle>Delete Earning Component</DialogTitle>
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
            loading={deleteEarningComponentLoading || deleteImpactPreviewLoading}
            disabled={!deleteImpactPreview?.previewHash || deleteImpactPreviewError}
            onClick={async () => {
              await deleteEarningComponent({
                id: deleteInformation?.id || '',
                previewHash: deleteImpactPreview?.previewHash,
              }).unwrap();
              shikshaMitraToast.success({ message: 'Earning Component deleted successfully' });
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
        wrapperProps={{ sx: { flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' } }}
        tableContainerProps={{ sx: { height: 1 } }}
        showColumns
        showExport
        showFullScreen
        exportScope="all"
        tableId="hr-earning-components"
        tableTitle="Earning components"
        onExport={exportTable}
        error={tableError}
        onRetry={refetch}
        serverSidePagination
        serverSideSearch
        page={tableQuery.page - 1}
        rowsPerPage={tableQuery.pageSize}
        totalCount={getEarningComponentsData?.totalCount || 0}
        onServerPagination={(page, pageSize) =>
          setTableQuery((current) => ({ ...current, page, pageSize }))
        }
        onServerSearch={(search) => setTableQuery((current) => ({ ...current, page: 1, search }))}
        isLoading={getEarningComponentsLoading || tableFetching}
        searchTerm={tableQuery.search}
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
                  showThreeDots={canViewEsi}
                  moreLabel={`More actions for ${row.earningComponentName}`}
                  actions={({ popover }) => (
                    <MenuList dense>
                      <MenuItem
                        onClick={() => {
                          popover.onClose();
                          setEsiComponent({
                            id: row.id,
                            name: row.earningComponentName || row.componentName || 'Earning',
                          });
                        }}
                      >
                        ESIC treatment
                      </MenuItem>
                    </MenuList>
                  )}
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
        {...operationalTableProps}
      />
      {esiComponent && (
        <EarningEsiTreatmentDialog
          key={esiComponent === 'all' ? 'all' : esiComponent.id}
          component={esiComponent === 'all' ? undefined : esiComponent}
          onClose={() => setEsiComponent(null)}
        />
      )}
      <CustomDialog
        maxWidth="md"
        open={isEarningComponentOpen.value}
        handleClose={() => {
          isEarningComponentOpen.onFalse();
          setEditData(null);
        }}
        title={editData ? 'Edit Earning Component' : 'Add Earning Component'}
        titleInfo="Configure salary components, dependencies, and payslip visibility."
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
      then: (schema) => schema.required('Calculation base is required'),
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
  const [previewUpdateImpact, { isLoading: previewUpdateImpactLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePreviewEarningComponentUpdateImpactMutation,
  });
  const [impactPreview, setImpactPreview] = useState<any>(null);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
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
        editData?.calculationBase === 'GROSS'
          ? grossSalaryOption.id
          : (editData?.selectedEarningComponentId || editData?.customComponentId) === editData?.id
            ? null
            : editData?.selectedEarningComponentId || editData?.customComponentId || null,
      amount:
        editData?.calculationType?.toLowerCase() === 'percentage'
          ? (editData?.percentage ?? '')
          : (editData?.amount ?? ''),
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
          calculationBase: getCalculationBase(
            values.calculationType,
            values.selectedEarningComponent
          ).calculationBase,
          selectedEarningComponentId: getCalculationBase(
            values.calculationType,
            values.selectedEarningComponent
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
          await addEarningComponent({ body: payload }).unwrap();
          shikshaMitraToast.success({ message: 'Earning Component added successfully' });
          handleClose(null, true);
        }
      } catch (error) {
        const parsed = parseApiProblemDetail(error);
        if (isEarningComponentDependencyError(parsed.errorCode)) {
          await formik.setFieldTouched('selectedEarningComponent', true, false);
          formik.setFieldError('selectedEarningComponent', parsed.detail);
        }
      }
    },
  });

  const confirmUpdate = async (applyMode: 'SyncedOnly' | 'ForceApply') => {
    if (!editData || !pendingPayload || !impactPreview) return;

    try {
      await updateEarningComponent({
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
      shikshaMitraToast.success({ message: 'Earning Component updated successfully' });
      handleClose(null, true);
    } catch (error) {
      const parsed = parseApiProblemDetail(error);
      if (isEarningComponentDependencyError(parsed.errorCode)) {
        setImpactPreview(null);
        setPendingPayload(null);
        await formik.setFieldTouched('selectedEarningComponent', true, false);
        formik.setFieldError('selectedEarningComponent', parsed.detail);
      }
    }
  };

  const { data: getEarningComponentsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEarningComponentsQuery,
    params: {
      academicYearId: currentYear?.id,
      pageSize: 200,
    },
  });

  const componentOptions = React.useMemo(
    () =>
      getEligibleEarningDependencyOptions(
        (getEarningComponentsData?.items || []).map((item: any) => ({
          ...item,
          componentName: item.earningComponentName || item.componentName,
          group: 'Earning Components',
        })),
        editData?.id
      ),
    [editData?.id, getEarningComponentsData]
  );

  return (
    <>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <DialogScrollContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Earning Details */}
            <FormSectionCard
              title="Earning Details"
              icon={GlobalIcons.receiptIcon}
              descriptionTooltip="Earning components define how staff salary is structured, such as Basic Pay or HRA."
            >
              <Grid container spacing={2}>
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
                      helperText={
                        (formik.touched.earningName && formik.errors.earningName) as string
                      }
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
                      helperText={
                        (formik.touched.earningType && formik.errors.earningType) as string
                      }
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
              </Grid>
            </FormSectionCard>

            {/* Calculation Rules */}
            <FormSectionCard
              title="Calculation Rules"
              icon={GlobalIcons.academicFieldSettings}
              descriptionTooltip="Calculation rules define how the earning component is calculated, such as percentage of Basic Pay or a fixed amount."
            >
              <Grid container spacing={2}>
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
                      error={
                        formik.touched.calculationType && Boolean(formik.errors.calculationType)
                      }
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
                        options={[grossSalaryOption, ...componentOptions]}
                        groupBy={(option) => option.group || 'Earning Components'}
                        getOptionLabel={(option) => option.componentName || ''}
                        filterOptions={(options) => options}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={
                          [grossSalaryOption, ...componentOptions].find(
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
                      <ShakingTextField
                        error={formik.touched.amount && Boolean(formik.errors.amount)}
                      >
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
                {formik.values.earningType === 'Fixed' &&
                  formik.values.calculationType === 'Amount' && (
                    <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                      <ShakingTextField
                        error={formik.touched.amount && Boolean(formik.errors.amount)}
                      >
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
              </Grid>
            </FormSectionCard>
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                <HrNotice icon={<Iconify icon="lucide:info" />} severity="info" variant="outlined">
                  <Typography variant="body2">
                    {/* 🔹 Main calculation explanation */}
                    {formik.values.calculationType === 'Percentage' ? (
                      <>
                        This earning will be calculated as{' '}
                        <strong>{formik.values.amount || 'X'}%</strong> of{' '}
                        <strong>
                          {[grossSalaryOption, ...componentOptions].find(
                            (c) => c.id === formik.values.selectedEarningComponent
                          )?.componentName || 'the selected component'}
                        </strong>
                        .
                        <br />
                        Gross Salary is the regular monthly gross adjusted for payable days.
                        Additional earnings do not increase this base.
                      </>
                    ) : (
                      <>
                        This earning will be added as a fixed amount of{' '}
                        <strong>{formik.values.amount || 'X'}</strong>
                        <br />
                        Example: If amount is ₹5,000, the same amount will be applied to all staff.
                      </>
                    )}
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {formik.values.earningType === 'Fixed'
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
                    ⚠️ This earning will <strong>not</strong> appear on staff payslips.
                  </Typography>
                </HrNotice>
              </Box>
            </Grid>
          </Box>
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
              addEarningComponentLoading ||
              updateEarningComponentLoading ||
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
            <HrNotice severity="info">
              Synced staff: {impactPreview?.syncedEmployeeCount ?? 0}
            </HrNotice>
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
            loading={updateEarningComponentLoading}
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
            loading={updateEarningComponentLoading}
            onClick={() => confirmUpdate('ForceApply')}
          >
            Force apply
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
