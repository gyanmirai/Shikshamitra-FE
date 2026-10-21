'use client';

import { capitalizeFirstLetter } from 'src/utils/input-format';
import { Stack, Button, TextField, DialogActions } from '@mui/material';

import { ConfirmDialog } from '../confirm-dialog';
import ShakingTextField from '../shaking-text-field';
import { DialogScrollContent } from '../customDialog';
import { useDivisionForm } from './use-division-form';
import { DivisionRoomField } from './division-room-field';
import { AcademicFormSection } from './academic-form-section';
import { academicValidationStyles } from './academic-form-styles';
import { AcademicFormActionIcon } from './academic-form-action-icon';

import type { DivisionFormProps } from './use-division-form';

export type { DivisionFormProps } from './use-division-form';

export function DivisionManagementForm({
  handleClose,
  editData,
  classId,
  showRoomSelection = true,
  existingDivisions,
}: DivisionFormProps) {
  const { formik, confirm, isSaving, saveDivision, nameInputRef } = useDivisionForm({
    handleClose,
    editData,
    classId,
    showRoomSelection,
    existingDivisions,
  });
  return (
    <>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          if (!isSaving) confirm.onFalse();
        }}
        disableCancel={isSaving}
        disableEscapeKeyDown={isSaving}
        title={editData ? 'Update Division' : 'Create Division'}
        content={`Are you sure you want to ${editData ? 'update' : 'create'} Division ${formik.values.name}?`}
        action={
          <Button
            variant="contained"
            loading={isSaving}
            onClick={saveDivision}
            startIcon={<AcademicFormActionIcon action="confirm" />}
          >
            Confirm
          </Button>
        }
      />
      <DialogScrollContent>
        <AcademicFormSection kind="division">
          <Stack spacing={2} sx={academicValidationStyles}>
            <ShakingTextField error={formik.touched.name && Boolean(formik.errors.name)}>
              <TextField
                fullWidth
                required
                autoFocus
                size="small"
                name="name"
                inputRef={nameInputRef}
                label="Division name"
                value={formik.values.name}
                disabled={isSaving}
                onChange={(event) =>
                  formik.setFieldValue('name', capitalizeFirstLetter(event.target.value))
                }
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </ShakingTextField>
            <ShakingTextField error={formik.touched.strength && Boolean(formik.errors.strength)}>
              <TextField
                fullWidth
                required
                size="small"
                name="strength"
                label="Strength"
                type="number"
                value={formik.values.strength}
                disabled={isSaving}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.strength && Boolean(formik.errors.strength)}
                helperText={formik.touched.strength && formik.errors.strength}
              />
            </ShakingTextField>
            {showRoomSelection && (
              <DivisionRoomField
                roomId={editData?.roomId}
                roomNumber={editData?.roomNumber}
                disabled={isSaving}
                onChange={(value) => formik.setFieldValue('roomNumber', value)}
              />
            )}
          </Stack>
        </AcademicFormSection>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          size="small"
          disabled={isSaving}
          onClick={handleClose}
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
