'use client';

import dayjs from 'dayjs';
import { capitalize } from 'lodash';
import { useGetShiftsQuery } from 'src/redux/shiftManagement/shift-management-api';
import { Stack, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import { ConfirmDialog } from '../confirm-dialog';
import { useStandardForm } from './use-standard-form';
import { DialogScrollContent } from '../customDialog';
import { academicValidationStyles } from './academic-form-styles';
import { AcademicFormActionIcon } from './academic-form-action-icon';

import type { StandardFormProps } from './standard-form-model';

type ShiftOption = { id: string; shiftName: string; startTime: string; endTime: string };

export function StandardManagementForm(props: StandardFormProps) {
  const { editData, handleClose } = props;
  const { formik, confirm, saveStandard, isSaving } = useStandardForm(props);
  const { data, isLoading: isShiftLoading } = useGetShiftsQuery(undefined);
  const shifts: ShiftOption[] = data?.items ?? [];
  return (
    <>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          if (!isSaving) confirm.onFalse();
        }}
        disableCancel={isSaving}
        disableEscapeKeyDown={isSaving}
        title={editData ? 'Update Standard' : 'Create Standard'}
        content={`Are you sure you want to ${editData ? 'update' : 'create'} Standard ${formik.values.name}?`}
        action={
          <Button
            variant="contained"
            loading={isSaving}
            onClick={saveStandard}
            startIcon={<AcademicFormActionIcon action="confirm" />}
          >
            Confirm
          </Button>
        }
      />
      <DialogScrollContent>
        <Stack spacing={2} sx={academicValidationStyles}>
          <TextField
            fullWidth
            required
            autoFocus
            size="small"
            name="name"
            label="Class Name"
            value={formik.values.name}
            disabled={isSaving}
            onChange={(event) => formik.setFieldValue('name', capitalize(event.target.value))}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
          <TextField
            fullWidth
            required
            size="small"
            name="ageLowerLimit"
            label="Limit Of Age"
            type="number"
            value={formik.values.ageLowerLimit}
            disabled={isSaving}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.ageLowerLimit && Boolean(formik.errors.ageLowerLimit)}
            helperText={formik.touched.ageLowerLimit && formik.errors.ageLowerLimit}
          />
          <Autocomplete
            disabled={isSaving || isShiftLoading}
            options={shifts}
            value={shifts.find((shift) => shift.id === formik.values.shiftId) ?? null}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) =>
              `${option.shiftName} (${dayjs(option.startTime, 'HH:mm:ss').format('hh:mm A')}-${dayjs(option.endTime, 'HH:mm:ss').format('hh:mm A')})`
            }
            renderInput={(params) => (
              <TextField {...params} label="Shift (optional)" size="small" />
            )}
            onChange={(_, value) => formik.setFieldValue('shiftId', value?.id ?? '')}
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          size="small"
          onClick={handleClose}
          disabled={isSaving}
          startIcon={<AcademicFormActionIcon action="cancel" />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          loading={isSaving}
          startIcon={<AcademicFormActionIcon action="submit" />}
          onClick={() => formik.handleSubmit()}
        >
          Submit
        </Button>
      </DialogActions>
    </>
  );
}
