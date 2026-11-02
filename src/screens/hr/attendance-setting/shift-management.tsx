'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Add } from '@mui/icons-material';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { TimePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import {
  Box,
  Grid,
  Alert,
  Switch,
  Button,
  TextField,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import {
  SetupEditorBody,
  SetupEditorActions,
  useHrSetupEditorState,
} from 'src/screens/hr/setup/hr-setup-editor-context';
import {
  useGetWorkShiftsQuery,
  useAddWorkShiftMutation,
  useUpdateWorkShiftMutation,
  useDeleteWorkShiftMutation,
} from 'src/redux/hr/work-shifts-api';

import { isValidShiftTimeRange } from './shift-management-utils';

type ShiftRow = {
  isActive: boolean;
  isAssigned: boolean;
  concurrencyStamp: string;
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
};

type ShiftFormValues = {
  isActive: boolean;
  shiftName: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
};

const parseShiftTime = (value?: string | null) =>
  value ? dayjs(value, ['HH:mm:ss', 'HH:mm'], true) : null;

const formatShiftTime = (value?: string | null) => {
  const parsed = parseShiftTime(value);
  return parsed?.isValid() ? parsed.format('hh:mm A') : value || '';
};

const ShiftManagement = () => {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canAdd = hasGrantedPermission(
    permissions,
    'HR.AttendanceAndLeave.Setting.ShiftManagement.Add'
  );
  const canDelete = hasGrantedPermission(
    permissions,
    'HR.AttendanceAndLeave.Setting.ShiftManagement.Delete'
  );
  const [tablePage, setTablePage] = useState({ number: 1, size: 20 });
  const [shiftSorts, setShiftSorts] = useState<
    Array<{ column: string; direction: 'asc' | 'desc' }>
  >([]);
  const selectedSort = shiftSorts.at(-1);
  const sorting = selectedSort
    ? `${selectedSort.column} ${selectedSort.direction}, id asc`
    : undefined;
  const exportTable = useHrTableExport('hr-shifts', {});
  const confirm = useBoolean();
  const shiftDialog = useBoolean();
  const [editData, setEditData] = useState<ShiftRow | null>(null);
  const [deleteInformation, setDeleteInformation] = useState<ShiftRow | null>(null);

  const {
    data,
    isLoading,
    error: tableError,
    isFetching: tableFetching,
    refetch: retryTable,
    tableProps: operationalTableProps,
  } = useHrTableQuery(
    {
      table: 'hr-shifts',
      genericSearch: true,
      query: {},
      page: tablePage.number - 1,
      size: tablePage.size,
      resetPage: () => setTablePage((current) => ({ ...current, number: 1 })),
    },
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetWorkShiftsQuery,
      params: {
        skipCount: (tablePage.number - 1) * tablePage.size,
        maxResultCount: tablePage.size,
        sorting,
      },
    })
  );

  const [deleteShift, { isLoading: isDeleting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteWorkShiftMutation,
  });

  const [formState, setFormState] = useState({ dirty: false, busy: false });
  const [discardOpen, setDiscardOpen] = useState(false);
  const requestCloseDialog = () => {
    if (formState.busy) return;
    if (formState.dirty) setDiscardOpen(true);
    else closeDialog();
  };
  const closeDialog = () => {
    setDiscardOpen(false);
    setFormState({ dirty: false, busy: false });
    shiftDialog.onFalse();
    setTimeout(() => setEditData(null), 200);
  };

  const handleDelete = async () => {
    if (!deleteInformation?.id) return;
    try {
      await deleteShift({
        id: deleteInformation.id,
        concurrencyStamp: deleteInformation.concurrencyStamp,
      }).unwrap();
      shikshaMitraToast.success({ message: 'Shift deleted successfully.' });
      setDeleteInformation(null);
      confirm.onFalse();
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Failed to delete shift.',
      });
    }
  };

  return (
    <Box
      sx={{ height: '100%', minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}
    >
      <CustomBreadcrumbs
        heading="Work Shifts"
        slotProps={{
          action: { justifyContent: 'flex-end', alignSelf: { xs: 'flex-end', md: 'center' } },
          heading: {},
          moreLink: {},
          breadcrumbs: {},
        }}
        description="Configure shift timings used by attendance evaluation. Manage advanced attendance rules in Policies & Rules."
        links={[
          { name: 'Attendance Management', href: hrPaths.attendance.dashboard },
          { name: 'Work Shifts' },
        ]}
        action={
          canAdd && (
            <Button
              startIcon={<Add />}
              variant="contained"
              size="small"
              onClick={shiftDialog.onTrue}
              disabled={!canAdd}
            >
              Create work shift
            </Button>
          )
        }
      />

      <CustomizableTable
        showColumns
        showExport
        showFullScreen
        exportScope="all"
        tableId="hr-attendance-shift-management"
        tableTitle="Staff shifts"
        onExport={exportTable}
        error={tableError}
        onRetry={retryTable}
        serverSidePagination
        serverSideSort
        serverSideSortMode="single"
        sorts={shiftSorts}
        onServerSort={(_, sorts) => {
          setShiftSorts(
            sorts
              .filter(({ column }) => ['shiftName', 'startTime', 'endTime'].includes(column))
              .slice(-1)
          );
          setTablePage((current) => ({ ...current, number: 1 }));
        }}
        exportContext={[
          'All shifts matching the table search and column filters, in the selected order.',
        ]}
        isSearch={false}
        page={tablePage.number - 1}
        rowsPerPage={tablePage.size}
        totalCount={data?.totalCount || 0}
        onServerPagination={(number, size) => setTablePage({ number, size })}
        wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
        tableContainerProps={{ sx: { height: 1 } }}
        isLoading={isLoading || tableFetching}
        noDataText={
          <>
            No shifts configured.
            <Button
              size="small"
              variant="outlined"
              color="primary"
              sx={{ display: 'flex', mx: 'auto', mt: 1 }}
              onClick={shiftDialog.onTrue}
            >
              Create work shift
            </Button>
          </>
        }
        columns={[
          { id: 'shiftName', label: 'Shift Name' },
          {
            id: 'isActive',
            label: 'Status',
            isFilter: false,
            isSort: false,
            excludeFromExport: true,
            render: (active: boolean) => (
              <Label color={active ? 'success' : 'default'}>{active ? 'Active' : 'Inactive'}</Label>
            ),
          },
          {
            id: 'startTime',
            label: 'Start Time',
            render: (value: string) => formatShiftTime(value),
          },
          {
            id: 'endTime',
            label: 'End Time',
            render: (value: string) => formatShiftTime(value),
          },
          {
            excludeFromExport: true,
            id: 'action',
            isSort: false,
            isFilter: false,
            sticky: true,
            stickyPosition: 'right' as const,
            align: 'left',
            label: 'Actions',
            minWidth: '70px',
            render: (_value, row) => {
              const shift = row as ShiftRow;

              return (
                <ThreeDotsActions
                  viewLabel={`View ${String(row.shiftName || row.id)}`}
                  editLabel={`Edit ${String(row.shiftName || row.id)}`}
                  deleteLabel={`Delete ${String(row.shiftName || row.id)}`}
                  moreLabel={`More actions for ${String(row.shiftName || row.id)}`}
                  showThreeDots={false}
                  showEditIcon={canAdd}
                  showDeleteIcon={canDelete && !shift.isAssigned}
                  handleEditClick={() => {
                    setEditData(shift);
                    shiftDialog.onTrue();
                  }}
                  handleDeleteClick={() => {
                    setDeleteInformation(shift);
                    confirm.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={data?.items || []}
        {...operationalTableProps}
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setDeleteInformation(null);
          confirm.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete <strong>{deleteInformation?.shiftName}</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleting}
            variant="contained"
            color="error"
            size="small"
            onClick={handleDelete}
          >
            Yes
          </LoadingButton>
        }
      />

      <CustomDialog
        hasForm={false}
        hasUnsavedChanges={formState.dirty}
        guardUnsavedChanges={false}
        disableClose={formState.busy}
        maxWidth="sm"
        title={editData ? 'Edit Work Shift' : 'Create Work Shift'}
        titleInfo="Define employee working hours independently of school sessions. Assigned times remain fixed."
        handleClose={requestCloseDialog}
        open={shiftDialog.value}
      >
        <ShiftManagementForm
          handleClose={requestCloseDialog}
          onSaved={closeDialog}
          editData={editData}
          onStateChange={setFormState}
        />
      </CustomDialog>
      <ConfirmDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        title="Discard Changes"
        icon="warning"
        cancelText="Keep editing"
        content="Your unsaved work shift changes will be lost."
        action={
          <Button size="small" variant="contained" color="warning" onClick={closeDialog}>
            Discard changes
          </Button>
        }
      />
    </Box>
  );
};

export default ShiftManagement;

export const ShiftManagementForm = ({
  handleClose,
  onSaved,
  editData,
  onStateChange,
}: {
  handleClose: () => void;
  onSaved?: () => void;
  editData: ShiftRow | null;
  onStateChange?: (state: { dirty: boolean; busy: boolean }) => void;
}) => {
  const [addShift, { isLoading: isAdding }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddWorkShiftMutation,
  });

  const [updateShift, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateWorkShiftMutation,
  });

  const formik = useFormik<ShiftFormValues>({
    enableReinitialize: true,
    initialValues: {
      shiftName: editData?.shiftName || '',
      isActive: editData?.isActive ?? true,
      startTime: parseShiftTime(editData?.startTime) || dayjs('2024-01-01T09:00:00'),
      endTime: parseShiftTime(editData?.endTime) || dayjs('2024-01-01T17:00:00'),
    },
    validationSchema: Yup.object({
      shiftName: Yup.string().trim().required('Shift name is required'),
      startTime: Yup.mixed<Dayjs>().required('Start time is required'),
      endTime: Yup.mixed<Dayjs>()
        .required('End time is required')
        .test('after-start', 'End time must be after start time', (_value, context) =>
          isValidShiftTimeRange(context.parent.startTime, context.parent.endTime)
        ),
    }),
    onSubmit: async (values) => {
      const body = {
        shiftName: values.shiftName.trim(),
        isActive: values.isActive,
        concurrencyStamp: editData?.concurrencyStamp,
        startTime: values.startTime?.format('HH:mm:ss'),
        endTime: values.endTime?.format('HH:mm:ss'),
      };

      try {
        if (editData?.id) {
          await updateShift({ id: editData.id, body }).unwrap();
          shikshaMitraToast.success({ message: 'Shift updated successfully.' });
        } else {
          await addShift(body).unwrap();
          shikshaMitraToast.success({ message: 'Shift added successfully.' });
        }
        (onSaved || handleClose)();
      } catch (error) {
        shikshaMitraToast.error({
          message: parseApiProblemDetail(error).detail || 'Failed to save work shift.',
        });
      }
    },
  });

  React.useEffect(() => {
    onStateChange?.({ dirty: formik.dirty, busy: isAdding || isUpdating });
  }, [onStateChange, formik.dirty, isAdding, isUpdating]);

  useHrSetupEditorState({
    dirty: formik.dirty,
    busy: isAdding || isUpdating || formik.isSubmitting,
    save: formik.submitForm,
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <SetupEditorBody>
        <FormSectionCard
          title="Shift Details"
          icon={GlobalIcons.clock}
          descriptionTooltip="Employee work shifts are independent of school sessions. Assigned timings cannot change."
        >
          {editData?.isAssigned && (
            <Alert severity="info">
              Assigned timings are fixed. Create a new work shift to change working hours.
            </Alert>
          )}
          <ShakingTextField error={formik.touched.shiftName && Boolean(formik.errors.shiftName)}>
            <TextField
              label="Shift Name *"
              name="shiftName"
              value={formik.values.shiftName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.shiftName && Boolean(formik.errors.shiftName)}
              helperText={formik.touched.shiftName ? formik.errors.shiftName : undefined}
              size="small"
              fullWidth
            />
          </ShakingTextField>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ShakingTextField
                error={formik.touched.startTime && Boolean(formik.errors.startTime)}
              >
                <TimePicker
                  label="Start Time"
                  disabled={editData?.isAssigned}
                  value={formik.values.startTime}
                  format="hh:mm A"
                  onChange={(date) => formik.setFieldValue('startTime', date)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      name: 'startTime',
                      error: formik.touched.startTime && Boolean(formik.errors.startTime),
                      helperText: formik.touched.startTime
                        ? String(formik.errors.startTime || '')
                        : undefined,
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ShakingTextField error={formik.touched.endTime && Boolean(formik.errors.endTime)}>
                <TimePicker
                  label="End Time"
                  disabled={editData?.isAssigned}
                  value={formik.values.endTime}
                  format="hh:mm A"
                  onChange={(date) => formik.setFieldValue('endTime', date)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      name: 'endTime',
                      error: formik.touched.endTime && Boolean(formik.errors.endTime),
                      helperText: formik.touched.endTime
                        ? String(formik.errors.endTime || '')
                        : undefined,
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
          </Grid>
          <FormControlLabel
            control={
              <Switch
                checked={formik.values.isActive}
                onChange={(_, checked) => formik.setFieldValue('isActive', checked)}
              />
            }
            label="Active"
          />
        </FormSectionCard>
      </SetupEditorBody>
      <SetupEditorActions>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:close-fill" />}
            size="small"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <LoadingButton
            loading={isAdding || isUpdating}
            type="submit"
            variant="contained"
            size="small"
            startIcon={<Iconify icon="eva:save-fill" />}
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </SetupEditorActions>
    </Box>
  );
};
