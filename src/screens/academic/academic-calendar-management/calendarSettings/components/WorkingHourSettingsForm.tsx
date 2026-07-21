'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Add } from '@mui/icons-material';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  SchoolShiftType,
  SCHOOL_SHIFT_TYPE_LABELS,
  SCHOOL_SHIFT_TYPE_OPTIONS,
} from 'src/enums/academic-calendar';
import {
  Box,
  Stack,
  Button,
  Select,
  Switch,
  Tooltip,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
  FormControlLabel,
} from '@mui/material';
import {
  useGetWorkingHoursQuery,
  useCreateWorkingHourMutation,
  useUpdateWorkingHourMutation,
  useDeleteWorkingHourMutation,
} from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';

const workingHourSchema = Yup.object().shape({
  shiftType: Yup.number().required('Shift type is required'),
  startTime: Yup.string().required('Start time is required'),
  endTime: Yup.string().required('End time is required'),
  standardId: Yup.string().required('Class is required'),
});

interface Props {
  calendarId: string;
}

interface WorkingHourFormProps {
  formik: any;
  editData: any;
  classes: any[];
  creating: boolean;
  updating: boolean;
  onClose: () => void;
}

const WorkingHourForm = ({
  formik,
  editData,
  classes,
  creating,
  updating,
  onClose,
}: WorkingHourFormProps) => (
  <Box component="form" onSubmit={formik.handleSubmit} noValidate>
    <Stack spacing={1}>
      <FormControl fullWidth size="small">
        <InputLabel>Class (Standard) *</InputLabel>
        <Select
          label="Class (Standard) *"
          name="standardId"
          value={formik.values.standardId}
          onChange={formik.handleChange}
          disabled={Boolean(editData?.standardId && editData?.id)}
          error={formik.touched.standardId && Boolean(formik.errors.standardId)}
        >
          {classes.map((cls: any) => (
            <MenuItem key={cls.id} value={cls.id}>
              {cls.name}
            </MenuItem>
          ))}
        </Select>
        {formik.touched.standardId && formik.errors.standardId && (
          <Typography variant="caption" color="error" sx={{ mx: 1.7, mt: 0.5 }}>
            {formik.errors.standardId as string}
          </Typography>
        )}
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel>Shift Type *</InputLabel>
        <Select
          label="Shift Type *"
          name="shiftType"
          value={formik.values.shiftType}
          onChange={formik.handleChange}
        >
          {SCHOOL_SHIFT_TYPE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          size="small"
          label="Start Time *"
          type="time"
          name="startTime"
          value={formik.values.startTime}
          onChange={formik.handleChange}
          InputLabelProps={{ shrink: true }}
          error={formik.touched.startTime && Boolean(formik.errors.startTime)}
          helperText={formik.touched.startTime ? (formik.errors.startTime as string) : undefined}
        />
        <TextField
          fullWidth
          size="small"
          label="End Time *"
          type="time"
          name="endTime"
          value={formik.values.endTime}
          onChange={formik.handleChange}
          InputLabelProps={{ shrink: true }}
          error={formik.touched.endTime && Boolean(formik.errors.endTime)}
          helperText={formik.touched.endTime ? (formik.errors.endTime as string) : undefined}
        />
      </Stack>
      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          size="small"
          label="Recess Start"
          type="time"
          name="recessStartTime"
          value={formik.values.recessStartTime}
          onChange={formik.handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          size="small"
          label="Recess End"
          type="time"
          name="recessEndTime"
          value={formik.values.recessEndTime}
          onChange={formik.handleChange}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={formik.values.isDefault}
            onChange={(e) => formik.setFieldValue('isDefault', e.target.checked)}
          />
        }
        label="Set as default working hour"
      />
      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        <LoadingButton variant="outlined" onClick={onClose} disabled={creating || updating}>
          Cancel
        </LoadingButton>
        <LoadingButton type="submit" variant="contained" loading={creating || updating}>
          {editData?.id ? 'Update' : 'Add'}
        </LoadingButton>
      </Stack>
    </Stack>
  </Box>
);

const WorkingHourSettingsForm = ({ calendarId }: Props) => {
  const addDialog = useBoolean(false);
  const editDialog = useBoolean(false);
  const [editData, setEditData] = useState<any>(null);

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const classes = useMemo(
    () => medium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [],
    [medium]
  );

  const { data: hoursData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetWorkingHoursQuery,
    params: calendarId,
    options: { skip: !calendarId },
    popupConfig: { error: false },
  });

  const [createHour, { isLoading: creating }] = useCreateWorkingHourMutation();
  const [updateHour, { isLoading: updating }] = useUpdateWorkingHourMutation();
  const [deleteHour, { isLoading: deleting }] = useDeleteWorkingHourMutation();

  const hours: any[] = useMemo(() => hoursData?.items ?? hoursData ?? [], [hoursData]);

  const tableData = useMemo(
    () =>
      classes.map((cls: any) => {
        const shift = hours.find((h: any) => h.standardId === cls.id);
        return {
          id: cls.id,
          className: cls.name,
          shift,
        };
      }),
    [classes, hours]
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      shiftType: editData?.shiftType ?? SchoolShiftType.FullDay,
      startTime: editData?.startTime?.slice(0, 5) ?? '08:00',
      endTime: editData?.endTime?.slice(0, 5) ?? '14:30',
      recessStartTime: editData?.recessStartTime?.slice(0, 5) ?? '',
      recessEndTime: editData?.recessEndTime?.slice(0, 5) ?? '',
      isDefault: editData?.isDefault ?? false,
      standardId: editData?.standardId ?? '',
    },
    validationSchema: workingHourSchema,
    onSubmit: async (values) => {
      const payload = {
        ...values,
        startTime: values.startTime.includes(':00') ? values.startTime : `${values.startTime}:00`,
        endTime: values.endTime.includes(':00') ? values.endTime : `${values.endTime}:00`,
        recessStartTime: values.recessStartTime
          ? values.recessStartTime.includes(':00')
            ? values.recessStartTime
            : `${values.recessStartTime}:00`
          : null,
        recessEndTime: values.recessEndTime
          ? values.recessEndTime.includes(':00')
            ? values.recessEndTime
            : `${values.recessEndTime}:00`
          : null,
      };
      try {
        if (editData && editData.id) {
          await updateHour({ id: editData.id, body: payload }).unwrap();
          shikshaMitraToast.success({ message: 'Working hour updated' });
          editDialog.onFalse();
        } else {
          await createHour({ calendarId, body: payload }).unwrap();
          shikshaMitraToast.success({ message: 'Working hour added' });
          addDialog.onFalse();
        }
        formik.resetForm();
        setEditData(null);
      } catch (err: any) {
        shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to save' });
      }
    },
  });

  const handleEdit = useCallback(
    (h: any) => {
      setEditData(h);
      editDialog.onTrue();
    },
    [editDialog]
  );

  const handleAssignShift = useCallback(
    (row: any) => {
      setEditData({
        standardId: row.id,
        shiftType: SchoolShiftType.FullDay,
        startTime: '08:00',
        endTime: '14:30',
        recessStartTime: '',
        recessEndTime: '',
        isDefault: false,
      });
      addDialog.onTrue();
    },
    [addDialog]
  );

  const handleAddShift = useCallback(() => {
    setEditData(null);
    addDialog.onTrue();
  }, [addDialog]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteHour(id).unwrap();
        shikshaMitraToast.success({ message: 'Working hour deleted' });
      } catch {
        shikshaMitraToast.error({ message: 'Failed to delete' });
      }
    },
    [deleteHour]
  );

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'className',
        label: 'Class',
        render: (row: any) => (
          <Typography variant="subtitle2" fontWeight={600}>
            {row.className}
          </Typography>
        ),
      },
      {
        id: 'shiftType',
        label: 'Shift Type',
        render: (row: any) => {
          if (!row.shift) {
            return (
              <Label variant="soft" color="warning">
                Not Assigned
              </Label>
            );
          }
          return (
            <Typography variant="body2" fontWeight={500}>
              {SCHOOL_SHIFT_TYPE_LABELS[row.shift.shiftType as SchoolShiftType]}
            </Typography>
          );
        },
      },
      {
        id: 'startTime',
        label: 'Start Time',
        render: (row: any) => (
          <Typography variant="body2">
            {row.shift?.startTime ? row.shift.startTime.slice(0, 5) : '—'}
          </Typography>
        ),
      },
      {
        id: 'endTime',
        label: 'End Time',
        render: (row: any) => (
          <Typography variant="body2">
            {row.shift?.endTime ? row.shift.endTime.slice(0, 5) : '—'}
          </Typography>
        ),
      },
      {
        id: 'recess',
        label: 'Recess',
        render: (row: any) => {
          if (!row.shift?.recessStartTime)
            return (
              <Typography variant="caption" color="text.disabled">
                —
              </Typography>
            );
          return (
            <Typography variant="caption" color="text.secondary">
              {row.shift.recessStartTime.slice(0, 5)} – {row.shift.recessEndTime.slice(0, 5)}
            </Typography>
          );
        },
      },
      {
        id: 'isDefault',
        label: 'Default',
        render: (row: any) => {
          if (row.shift?.isDefault) {
            return (
              <Label variant="soft" color="primary">
                Default
              </Label>
            );
          }
          return (
            <Typography variant="caption" color="text.disabled">
              —
            </Typography>
          );
        },
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'right',
        render: (row: any) => (
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            {row.shift ? (
              <>
                <Tooltip title="Edit Shift">
                  <IconButton size="small" onClick={() => handleEdit(row.shift)}>
                    <Iconify icon="mdi:pencil-outline" width={16} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Shift">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(row.shift.id)}
                    disabled={deleting}
                  >
                    <Iconify icon="mdi:trash-can-outline" width={16} />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleAssignShift(row)}
                sx={{ py: 0.25, px: 1, borderRadius: 1.5, fontSize: '12px' }}
              >
                Assign Shift
              </Button>
            )}
          </Stack>
        ),
      },
    ],
    [deleting, handleEdit, handleDelete, handleAssignShift]
  );

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="subtitle2" fontWeight={700}>
          Working Hours Configuration
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Add />}
          onClick={handleAddShift}
          disabled={!calendarId}
        >
          Add Shift
        </Button>
      </Stack>

      {!calendarId && (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
          Select a calendar to configure working hours
        </Typography>
      )}

      {calendarId && (
        <CustomizableTable
          tableId="working-hours-settings-table"
          isLoading={isLoading}
          isPagination={false}
          isSearch={false}
          isFilter={false}
          isShowedDense={false}
          columns={columns}
          data={tableData}
          noDataText={
            <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="mdi:clock-outline" width={32} color="text.disabled" />
              </Box>
              <Typography variant="subtitle2" color="text.secondary">
                No classes configured for this medium
              </Typography>
            </Stack>
          }
        />
      )}

      <CustomDialog
        open={addDialog.value}
        handleClose={() => {
          addDialog.onFalse();
          setEditData(null);
          formik.resetForm();
        }}
        title="Add Working Hour"
        maxWidth="xs"
      >
        <WorkingHourForm
          formik={formik}
          editData={editData}
          classes={classes}
          creating={creating}
          updating={updating}
          onClose={() => {
            addDialog.onFalse();
            setEditData(null);
            formik.resetForm();
          }}
        />
      </CustomDialog>

      <CustomDialog
        open={editDialog.value}
        handleClose={() => {
          editDialog.onFalse();
          setEditData(null);
          formik.resetForm();
        }}
        title="Edit Working Hour"
        maxWidth="xs"
      >
        <WorkingHourForm
          formik={formik}
          editData={editData}
          classes={classes}
          creating={creating}
          updating={updating}
          onClose={() => {
            editDialog.onFalse();
            setEditData(null);
            formik.resetForm();
          }}
        />
      </CustomDialog>
    </Box>
  );
};

export default WorkingHourSettingsForm;
