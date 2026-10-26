'use client';

import dayjs from 'dayjs';
import { useGetShiftsQuery } from 'src/redux/shiftManagement/shift-management-api';
import { Stack, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import { ConfirmDialog } from '../confirm-dialog';
import ShakingTextField from '../shaking-text-field';
import { useStandardForm } from './use-standard-form';
import { DialogScrollContent } from '../customDialog';
import { AcademicFormSection } from './academic-form-section';
import { academicValidationStyles } from './academic-form-styles';
import { useAcademicNamePreview } from './use-academic-name-preview';
import { useAcademicFormClose } from './academic-form-close-context';
import { AcademicFormActionIcon } from './academic-form-action-icon';

import type { StandardFormProps } from './standard-form-model';

type ShiftOption = { id: string; shiftName: string; startTime: string; endTime: string };

export function StandardManagementForm(props: StandardFormProps) {
  const { editData, handleClose } = props;
  const { formik, confirm, saveStandard, isSaving } = useStandardForm(props);
  const namePreview = useAcademicNamePreview('standard', formik.values.name, Boolean(editData));
  const requestClose = useAcademicFormClose(formik.dirty, isSaving, handleClose);
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
        <AcademicFormSection kind="standard">
          <Stack spacing={2} sx={academicValidationStyles}>
            <ShakingTextField error={formik.touched.name && Boolean(formik.errors.name)}>
              <TextField
                fullWidth
                required
                autoFocus
                size="small"
                name="name"
                label="Class name"
                value={formik.values.name}
                disabled={isSaving}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={
                  formik.touched.name && formik.errors.name ? formik.errors.name : namePreview
                }
              />
            </ShakingTextField>
            <ShakingTextField
              error={formik.touched.ageLowerLimit && Boolean(formik.errors.ageLowerLimit)}
            >
              <TextField
                fullWidth
                required
                size="small"
                name="ageLowerLimit"
                label="Limit of age"
                type="number"
                value={formik.values.ageLowerLimit}
                disabled={isSaving}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.ageLowerLimit && Boolean(formik.errors.ageLowerLimit)}
                helperText={formik.touched.ageLowerLimit && formik.errors.ageLowerLimit}
              />
            </ShakingTextField>
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
        </AcademicFormSection>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          size="small"
          onClick={requestClose}
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
