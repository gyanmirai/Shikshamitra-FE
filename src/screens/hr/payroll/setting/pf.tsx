'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import Add from '@mui/icons-material/Add';
import { GlobalIcons } from 'src/utils/icons';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmDialog } from 'src/hooks/use-confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  pfApi,
  useGetPFQuery,
  useAddPFMutation,
  useUpdatePFMutation,
  useDeletePFMutation,
} from 'src/redux/PF/PFApi';
import {
  Box,
  Stack,
  Button,
  Switch,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import { PfCoverageSettings } from './pf-coverage-settings';

interface IPF {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  tenantId: string;
  code: string;
  name: string;
  employeePercentage: number;
  employerPercentage: number;
  contributionBasis: number;
  wageCeiling?: number | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  version: number;
}
const PF = () => {
  const [showConfirm, ChangesConfirmDialog] = useConfirmDialog();
  const [tableQuery, setTableQuery] = useState({ page: 1, pageSize: 20, search: '' });
  const exportTable = useHrTableExport('hr-pf-rules', tableQuery);
  const dialog = useBoolean();
  const confirm = useBoolean();
  const [editData, setEditData] = useState<null | IPF>(null);
  // const [employee, setEmployee] = useState<string[] | undefined>([]);
  // Redux state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const {
    data: PFData,
    isLoading,
    refetch,
    error: tableError,
    isFetching: tableFetching,
    tableProps: operationalTableProps,
  } = useHrTableQuery(
    {
      table: 'hr-pf-rules',
      query: tableQuery,
      page: tableQuery.page - 1,
      size: tableQuery.pageSize,
      resetPage: () => setTableQuery((current) => ({ ...current, page: 1 })),
    },
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetPFQuery,
      params: { academicYearId: currentYear?.id, ...tableQuery },
    })
  );
  const [deletePF, { isLoading: isPFDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeletePFMutation,
  });
  const dispatch = useDispatch();

  const handleClose = async (_e?: any, isSubmit?: boolean) => {
    if (
      isSubmit ||
      (isChanges &&
        (await showConfirm({
          title: 'Alert',
          message: 'Are you sure you want to discard changes?',
          icon: 'warning',
        })))
    ) {
      dispatch(setIsChanges(false));
      dialog.onFalse();
      setEditData(null);
    } else if (!isChanges) {
      dialog.onFalse();
      setEditData(null);
    }
  };

  const { confirmWithUndo } = useConfirmWithUndo();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <CustomBreadcrumbs
        heading="PF Rule"
        description="Configure PF rule for staff"
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard' },
          {
            name: 'Payroll Management',
            href: hrPaths.payroll.runPayroll,
          },
          { name: 'Settings', href: hrPaths.payroll.settings.earningComponents },
          { name: 'PF Rule' },
        ]}
        action={
          <Button size="small" startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
            PF Rule
          </Button>
        }
      />
      <PfCoverageSettings />
      {ChangesConfirmDialog}
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete <b>{editData?.name}</b> PF Rule?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isPFDeleteLoading}
            color="error"
            size="small"
            onClick={async () => {
              confirmWithUndo({
                item: editData,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    pfApi.util.updateQueryData(
                      'getPF',
                      { academicYearId: currentYear?.id },
                      (draft: any) => {
                        const index = draft.items?.findIndex((b: any) => b.id === editData?.id);
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.items.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: (dispatchFn, index) => refetch(),
                onCommit: () => deletePF(editData?.id || ''),
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
        showColumns
        showExport
        showFullScreen
        exportScope="all"
        noDataText={
          <>
            No PF Found{' '}
            <Box
              component="button"
              type="button"
              onClick={() => {
                dialog.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                border: 0,
                p: 0,
                bgcolor: 'transparent',
                font: 'inherit',
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: 2,
                },
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Add PF
            </Box>
          </>
        }
        tableId="pf-table"
        tableTitle="Provident fund rules"
        onExport={exportTable}
        error={tableError}
        onRetry={refetch}
        serverSidePagination
        serverSideSearch
        page={tableQuery.page - 1}
        rowsPerPage={tableQuery.pageSize}
        totalCount={PFData?.totalCount || 0}
        onServerPagination={(page, pageSize) =>
          setTableQuery((current) => ({ ...current, page, pageSize }))
        }
        onServerSearch={(value) =>
          setTableQuery((current) => ({ ...current, page: 1, search: value }))
        }
        isLoading={isLoading || tableFetching}
        columns={[
          { id: 'name', label: 'Name', sticky: true, minWidth: '140px', align: 'left' },
          { id: 'code', label: 'Code' },
          { id: 'employeePercentage', label: 'Staff Percentage', filterType: 'number' },
          { id: 'employerPercentage', label: 'Employer Percentage', filterType: 'number' },
          {
            id: 'contributionBasis',
            label: 'Contribution basis',
            render(value) {
              return value === 1 ? 'Basic + DA' : 'Basic';
            },
          },
          {
            id: 'wageCeiling',
            label: 'Wage ceiling',
            render(value) {
              const numericValue = Number(value);
              return value == null || value === '' || !Number.isFinite(numericValue)
                ? 'No ceiling'
                : formatCurrency(numericValue);
            },
          },
          {
            id: 'effectiveFrom',
            label: 'Effective from',
            render(value) {
              return value ? fDate(value) : '-';
            },
          },
          {
            id: 'isActive',
            label: 'Status',
            render(value) {
              return value ? 'Active' : 'Inactive';
            },
          },
          {
            id: 'action',
            label: 'Action',
            isSort: false,
            isFilter: false,
            sticky: true,
            stickyPosition: 'right' as const,
            minWidth: '80px',
            render(value, row) {
              return (
                <ThreeDotsActions
                  showEditIcon
                  showDeleteIcon
                  handleEditClick={() => {
                    setEditData(row as IPF);
                    dialog.onTrue();
                  }}
                  handleDeleteClick={() => {
                    setEditData(row as IPF);
                    confirm.onTrue();
                  }}
                  showThreeDots={false}
                />
              );
            },
          },
        ]}
        data={PFData?.items || []}
        {...operationalTableProps}
      />

      <CustomDialog
        open={dialog.value}
        handleClose={(e) => handleClose(e, false)}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">{editData ? 'Update PF Rule' : 'Create PF Rule'}</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="In this section, you can create a new Provident Fund (PF) entry by specifying the percentage to be deducted from the staff's salary."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <PFForm editData={editData} handleClose={handleClose} />
      </CustomDialog>
    </Box>
  );
};

export default PF;

const PFForm = ({
  editData,
  handleClose,
}: {
  editData: any;
  handleClose: (e: any, isSubmit?: boolean) => void;
}) => {
  const [addPF, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddPFMutation,
    isThrowError: true,
  });
  const [updatePF, { isLoading: isUpdatePFLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatePFMutation,
    isThrowError: true,
  });
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const formik = useFormik({
    initialValues: {
      code: editData?.code || '',
      name: editData?.name || '',
      employeePercentage: editData?.employeePercentage || '',
      employerPercentage: editData?.employerPercentage || '',
      contributionBasis: editData?.contributionBasis ?? 0,
      wageCeiling: editData?.wageCeiling ?? '',
      effectiveFrom: editData?.effectiveFrom?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      effectiveTo: editData?.effectiveTo?.slice(0, 10) || '',
      isActive: editData?.isActive ?? true,
    },
    validationSchema: Yup.object().shape({
      code: Yup.string().required('Code is required'),
      name: Yup.string().required('Name is required'),
      employeePercentage: Yup.number()
        .typeError('Staff Percentage must be a number')
        .required('Staff Percentage is required')
        .min(0, 'Staff Percentage cannot be less than 0')
        .max(100, 'Staff Percentage cannot be more than 100'),
      employerPercentage: Yup.number()
        .typeError('Employer Percentage must be a number')
        .required('Employer Percentage is required')
        .min(0, 'Employer Percentage cannot be less than 0')
        .max(100, 'Employer Percentage cannot be more than 100'),
      contributionBasis: Yup.number().oneOf([0, 1]).required('Contribution basis is required'),
      wageCeiling: Yup.number()
        .nullable()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .min(0, 'Wage ceiling cannot be negative'),
      effectiveFrom: Yup.string().required('Effective from is required'),
      effectiveTo: Yup.string()
        .nullable()
        .test(
          'after-effective-from',
          'Effective to must be on or after effective from',
          (value, context) =>
            !value || !context.parent.effectiveFrom || value >= context.parent.effectiveFrom
        ),
    }),
    onSubmit: async (values) => {
      try {
        const body = {
          ...values,
          wageCeiling: values.wageCeiling === '' ? null : Number(values.wageCeiling),
          effectiveTo: values.effectiveTo || null,
        };
        if (editData) {
          await updatePF({
            body: {
              ...body,
              academicYearId: currentYear?.id,
            },
            id: editData.id,
          }).unwrap();
          shikshaMitraToast.success({
            message: `PF rule "${values.name}" updated successfully`,
          });
        } else {
          await addPF({ body, academicYearId: currentYear?.id }).unwrap();
          shikshaMitraToast.success({
            message: `PF rule "${values.name}" created successfully`,
          });
        }
        handleClose(undefined, true);
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <DialogScrollContent>
          <Stack spacing={3}>
            <ShakingTextField error={formik.touched.name && Boolean(formik.errors.name)}>
              <TextField
                size="small"
                label="Name *"
                fullWidth
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={
                  formik.touched.name && formik.errors.name ? String(formik.errors.name) : ''
                }
              />
            </ShakingTextField>
            <ShakingTextField error={formik.touched.code && Boolean(formik.errors.code)}>
              <TextField
                size="small"
                label="Code *"
                fullWidth
                name="code"
                value={formik.values.code}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z_]/g, '');
                  formik.setFieldValue('code', value);
                }}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={
                  formik.touched.code && formik.errors.code ? String(formik.errors.code) : ''
                }
              />
            </ShakingTextField>
            <ShakingTextField
              error={formik.touched.employeePercentage && Boolean(formik.errors.employeePercentage)}
            >
              <TextField
                size="small"
                fullWidth
                label="Staff Percentage *"
                name="employeePercentage"
                type="number"
                value={formik.values.employeePercentage}
                onChange={(e) => {
                  const { value } = e.target;

                  // Allow empty value
                  if (value === '') {
                    formik.setFieldValue('employeePercentage', value);
                    return;
                  }

                  const numericValue = Number(value);

                  // Restrict between 0 and 100
                  if (numericValue >= 0 && numericValue <= 100) {
                    formik.setFieldValue('employeePercentage', numericValue);
                  }
                }}
                inputProps={{
                  min: 0,
                  max: 100,
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                error={
                  formik.touched.employeePercentage && Boolean(formik.errors.employeePercentage)
                }
                helperText={
                  (formik.touched.employeePercentage && formik.errors.employeePercentage) as string
                }
              />
            </ShakingTextField>
            <ShakingTextField
              error={formik.touched.employerPercentage && Boolean(formik.errors.employerPercentage)}
            >
              <TextField
                size="small"
                fullWidth
                label="Employer Percentage *"
                name="employerPercentage"
                type="number"
                value={formik.values.employerPercentage}
                onChange={(e) => {
                  const { value } = e.target;

                  // Allow empty value
                  if (value === '') {
                    formik.setFieldValue('employerPercentage', value);
                    return;
                  }

                  const numericValue = Number(value);

                  // Restrict between 0 and 100
                  if (numericValue >= 0 && numericValue <= 100) {
                    formik.setFieldValue('employerPercentage', numericValue);
                  }
                }}
                inputProps={{
                  min: 0,
                  max: 100,
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                error={
                  formik.touched.employerPercentage && Boolean(formik.errors.employerPercentage)
                }
                helperText={
                  (formik.touched.employerPercentage && formik.errors.employerPercentage) as string
                }
              />
            </ShakingTextField>
            <TextField
              select
              fullWidth
              size="small"
              label="Contribution basis"
              name="contributionBasis"
              value={formik.values.contributionBasis}
              onChange={formik.handleChange}
            >
              <MenuItem value={0}>Basic</MenuItem>
              <MenuItem value={1}>Basic + Dearness Allowance</MenuItem>
            </TextField>
            <TextField
              size="small"
              fullWidth
              label="Wage ceiling"
              name="wageCeiling"
              type="number"
              value={formik.values.wageCeiling}
              onChange={formik.handleChange}
              error={formik.touched.wageCeiling && Boolean(formik.errors.wageCeiling)}
              helperText={
                formik.touched.wageCeiling && formik.errors.wageCeiling
                  ? String(formik.errors.wageCeiling)
                  : 'Leave blank for no ceiling'
              }
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              size="small"
              fullWidth
              type="date"
              label="Effective from"
              name="effectiveFrom"
              value={formik.values.effectiveFrom}
              onChange={formik.handleChange}
              InputLabelProps={{ shrink: true }}
              error={formik.touched.effectiveFrom && Boolean(formik.errors.effectiveFrom)}
              helperText={
                formik.touched.effectiveFrom && formik.errors.effectiveFrom
                  ? String(formik.errors.effectiveFrom)
                  : ''
              }
            />
            <TextField
              size="small"
              fullWidth
              type="date"
              label="Effective to"
              name="effectiveTo"
              value={formik.values.effectiveTo}
              onChange={formik.handleChange}
              InputLabelProps={{ shrink: true }}
              error={formik.touched.effectiveTo && Boolean(formik.errors.effectiveTo)}
              helperText={
                formik.touched.effectiveTo && formik.errors.effectiveTo
                  ? String(formik.errors.effectiveTo)
                  : 'Optional'
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.isActive}
                  onChange={(_, checked) => formik.setFieldValue('isActive', checked)}
                />
              }
              label="Active rule"
            />
          </Stack>
        </DialogScrollContent>
      </BackPopUpChecked>
      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
          variant="outlined"
          onClick={(e) => handleClose(e, false)}
        >
          Cancel
        </Button>
        <LoadingButton
          loading={isLoading || isUpdatePFLoading}
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
