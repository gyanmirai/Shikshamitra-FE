'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { StudentLeaveType } from 'src/redux/student/attendance-type/attendance-type-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { attendanceError } from 'src/redux/student/attendance-management/types';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import {
  Box,
  Alert,
  Stack,
  Button,
  Switch,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import {
  useGetStudentAttendanceTypeQuery,
  useAddStudentAttendanceTypeMutation,
  useDeleteStudentAttendanceTypeMutation,
  useUpdateStudentAttendanceTypeMutation,
} from 'src/redux/student/attendance-type/attendance-type-api';

const leaveTypeSchema = Yup.object({
  type: Yup.string()
    .trim()
    .required('Leave Type Is Required')
    .min(2, 'Use At Least 2 Characters')
    .max(100, 'Use 100 Characters Or Fewer'),
  color: Yup.string().required('Leave Type Color Is Required'),
  isActive: Yup.boolean().required(),
});

export default function AttendanceType() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canWrite = hasGrantedPermission(permissions, 'Students.Attendance.Setting.LeaveType.Add');
  const canDelete = hasGrantedPermission(
    permissions,
    'Students.Attendance.Setting.LeaveType.Delete'
  );
  const [editing, setEditing] = useState<StudentLeaveType | null>(null);
  const [deleting, setDeleting] = useState<StudentLeaveType | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterText, setFilterText] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>();
  const [sorting, setSorting] = useState('leaveTypeName');
  const { currentData, isLoading, isFetching, isError, error, refetch } =
    useGetStudentAttendanceTypeQuery({
      filterText: filterText || undefined,
      isActive,
      sorting,
      skipCount: page * rowsPerPage,
      maxResultCount: rowsPerPage,
    });
  const [deleteLeaveType, deletion] = useDeleteStudentAttendanceTypeMutation();
  const rows = useMemo(
    () =>
      (currentData?.items ?? []).map((item) => ({
        ...item,
        lastUpdatedAt: item.lastModificationTime || item.creationTime || null,
      })),
    [currentData]
  );

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const closeForm = () => {
    if (formBusy) return;
    setFormOpen(false);
    setEditing(null);
    setFormDirty(false);
  };

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'leaveTypeName',
        label: 'Leave Type',
        minWidth: 260,
        sticky: true,
        stickyPosition: 'left',
        render: (value, row) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <SubjectColorIndicator color={row.color} />
            <Typography variant="body2" fontWeight={600}>
              {value}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'lastUpdatedAt',
        label: 'Last Updated',
        minWidth: 150,
        isSort: false,
        isFilter: false,
        render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : '—'),
      },
      {
        id: 'isActive',
        label: 'Status',
        minWidth: 120,
        sticky: true,
        stickyPosition: 'right',
        isSort: false,
        filterType: 'enum',
        enumOptions: [
          { label: 'Active', value: true },
          { label: 'Inactive', value: false },
        ],
        render: (value) => (
          <Label color={value ? 'success' : 'default'} variant="soft">
            {value ? 'Active' : 'Inactive'}
          </Label>
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 130,
        width: 130,
        align: 'center',
        sticky: true,
        stickyPosition: 'right',
        isSort: false,
        isFilter: false,
        excludeFromExport: true,
        render: (_, row) => (
          <AdaptiveThreeDotsActions
            moreLabel={`More Actions for ${row.leaveTypeName}`}
            actions={[
              ...(canWrite
                ? [
                    {
                      id: 'edit',
                      label: 'Edit',
                      icon: 'solar:pen-bold',
                      onClick: () => {
                        setEditing(row as StudentLeaveType);
                        setFormOpen(true);
                      },
                    },
                  ]
                : []),
              ...(canDelete
                ? [
                    {
                      id: 'delete',
                      label: 'Delete',
                      icon: 'solar:trash-bin-trash-bold',
                      color: 'error.main',
                      onClick: () => setDeleting(row as StudentLeaveType),
                    },
                  ]
                : []),
            ]}
          />
        ),
      },
    ],
    [canWrite, canDelete]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Attendance Settings"
        description="Manage the leave types available for student attendance and leave requests."
        links={[
          { name: 'Student', href: '/student/dashboard' },
          { name: 'Attendance', href: '/student/attendance/take-attendance' },
          { name: 'Settings' },
        ]}
        action={
          canWrite ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={openAdd}
            >
              Add Leave Type
            </Button>
          ) : null
        }
      />
      {isError && (
        <Alert
          severity="error"
          action={
            <Button startIcon={<Iconify icon={GlobalIcons.refresh} />} onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {attendanceError(error, 'Leave types could not be loaded.')}
        </Alert>
      )}
      <CustomizableTable
        tableId="student-attendance-leave-types"
        tableTitle="Leave Types"
        exportLabel="Export Current Page"
        columns={columns}
        data={rows}
        isLoading={isLoading || isFetching}
        serverSidePagination
        serverSideSearch
        serverSideSort
        serverSideFilter
        serverSideSortMode="single"
        totalCount={currentData?.totalCount ?? 0}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        onServerPagination={(nextPage, nextRowsPerPage) => {
          setPage(nextPage - 1);
          setRowsPerPage(nextRowsPerPage);
        }}
        onServerSearch={(value) => {
          setFilterText(value);
          setPage(0);
        }}
        onServerSort={(_, sorts) => {
          const sort = sorts[0];
          setSorting(
            sort?.column === 'leaveTypeName' ? `leaveTypeName ${sort.direction}` : 'leaveTypeName'
          );
          setPage(0);
        }}
        onServerFilter={(filters) => {
          const status = filters.find((filter) => filter.column === 'isActive');
          setIsActive(status ? status.value === true || status.value === 'true' : undefined);
          setPage(0);
        }}
        noDataText={
          filterText || isActive !== undefined
            ? 'No leave types match your search or filter.'
            : 'No leave types have been added yet.'
        }
        wrapperProps={{ sx: { flex: 1, minHeight: 0, overflow: 'hidden' } }}
        tableContainerProps={{ sx: { height: 1 } }}
      />
      <CustomDialog
        key={editing?.id ?? 'new'}
        open={formOpen}
        title={editing ? 'Edit Leave Type' : 'Add Leave Type'}
        titleInfo="Choose a name and color to identify this leave type in attendance."
        handleClose={closeForm}
        disableClose={formBusy}
        hasUnsavedChanges={formDirty}
      >
        <AttendanceTypeForm
          editData={editing}
          handleClose={(_, submitted) => {
            if (submitted) {
              setFormOpen(false);
              setEditing(null);
              setFormDirty(false);
            } else closeForm();
          }}
          onBusyChange={setFormBusy}
          onDirtyChange={setFormDirty}
        />
      </CustomDialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete Leave Type?"
        content={`Delete ${deleting?.leaveTypeName ?? 'this leave type'}? This action cannot be undone.`}
        onClose={() => {
          if (!deletion.isLoading) setDeleting(null);
        }}
        disableCancel={deletion.isLoading}
        disableBackdropClick={deletion.isLoading}
        action={
          <Button
            color="error"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            loading={deletion.isLoading}
            disabled={!canDelete || deletion.isLoading}
            onClick={async () => {
              if (!deleting) return;
              try {
                await deleteLeaveType(deleting.id).unwrap();
                shikshaMitraToast.success({ message: 'Leave type deleted.' });
                setDeleting(null);
              } catch (failure) {
                shikshaMitraToast.error({
                  message: attendanceError(failure, 'Leave type could not be deleted.'),
                });
              }
            }}
          >
            Delete Leave Type
          </Button>
        }
      />
    </Box>
  );
}

export function AttendanceTypeForm({
  handleClose,
  editData,
  onBusyChange,
  onDirtyChange,
}: {
  handleClose: (event: unknown, isSubmit: boolean) => void;
  editData?: Pick<StudentLeaveType, 'id' | 'leaveTypeName' | 'color' | 'isActive'> | null;
  onBusyChange?: (busy: boolean) => void;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [addLeaveType, adding] = useAddStudentAttendanceTypeMutation();
  const [updateLeaveType, updating] = useUpdateStudentAttendanceTypeMutation();
  const busy = adding.isLoading || updating.isLoading;
  const formik = useFormik({
    initialValues: {
      type: editData?.leaveTypeName ?? '',
      color: editData?.color ?? '',
      isActive: editData?.isActive ?? true,
    },
    validationSchema: leaveTypeSchema,
    onSubmit: async (values) => {
      const body = {
        leaveTypeName: values.type.trim(),
        color: values.color,
        isActive: values.isActive,
      };
      try {
        if (editData) await updateLeaveType({ id: editData.id, body }).unwrap();
        else await addLeaveType(body).unwrap();
        shikshaMitraToast.success({
          message: editData ? 'Leave type updated.' : 'Leave type added.',
        });
        handleClose(null, true);
      } catch (failure) {
        shikshaMitraToast.error({
          message: attendanceError(failure, 'Leave type could not be saved.'),
        });
      }
    },
  });
  // The same form is also used by the leave-request dialog.
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  useEffect(() => {
    onDirtyChange?.(formik.dirty);
  }, [formik.dirty, onDirtyChange]);
  const cancel = () => {
    if (formik.dirty && !window.confirm('Discard unsaved leave type changes?')) return;
    handleClose(null, false);
  };

  return (
    <Box>
      <DialogScrollContent>
        <FormBusyRegion busy={busy} label="Saving Leave Type…">
          <Stack spacing={2}>
            <ShakingTextField error={formik.touched.type && Boolean(formik.errors.type)}>
              <TextField
                fullWidth
                size="small"
                label="Leave Type *"
                name="type"
                value={formik.values.type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.type && Boolean(formik.errors.type)}
                helperText={formik.touched.type && formik.errors.type}
                disabled={busy}
              />
            </ShakingTextField>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Leave Type Color *
              </Typography>
              <ColorPickerCircle
                key={editData?.id ?? 'new'}
                initialColor={formik.values.color}
                onSelect={(color) => formik.setFieldValue('color', color)}
                disabled={busy}
              />
              {formik.submitCount > 0 && formik.errors.color && (
                <Typography variant="caption" color="error.main">
                  {formik.errors.color}
                </Typography>
              )}
            </Box>
            <FormControlLabel
              label="Active"
              control={
                <Switch
                  checked={formik.values.isActive}
                  disabled={busy}
                  onChange={(_, value) => formik.setFieldValue('isActive', value)}
                />
              }
            />
          </Stack>
        </FormBusyRegion>
      </DialogScrollContent>
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          disabled={busy}
          onClick={cancel}
        >
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<Iconify icon={editData ? GlobalIcons.submit : 'mdi:plus'} />}
          loading={busy}
          disabled={busy}
          onClick={() => formik.submitForm()}
        >
          {editData ? 'Save Changes' : 'Add Leave Type'}
        </Button>
      </DialogActions>
    </Box>
  );
}
