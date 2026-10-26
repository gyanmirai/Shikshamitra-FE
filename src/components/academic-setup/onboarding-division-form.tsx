'use client';

import { Box, Stack, Button, TextField, DialogActions } from '@mui/material';

import { ConfirmDialog } from '../confirm-dialog';
import { DialogScrollContent } from '../customDialog';
import { useDivisionForm } from './use-division-form';
import { academicValidationStyles } from './academic-form-styles';
import { useAcademicNamePreview } from './use-academic-name-preview';
import { AcademicFormActionIcon } from './academic-form-action-icon';

import type { ExistingDivision } from './onboarding-division-model';

export function OnboardingDivisionForm({
  handleClose,
  classId,
  existingDivisions,
}: {
  handleClose: () => void;
  classId: string | number;
  existingDivisions?: ExistingDivision[];
}) {
  const {
    formik,
    confirm,
    isSaving: isLoading,
    saveDivision,
    nameInputRef,
  } = useDivisionForm({
    handleClose,
    classId,
    editData: null,
    existingDivisions,
    showRoomSelection: false,
  });
  const namePreview = useAcademicNamePreview('division', formik.values.name);

  return (
    <Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          if (!isLoading) confirm.onFalse();
        }}
        disableCancel={isLoading}
        disableBackdropClick={isLoading}
        disableEscapeKeyDown={isLoading}
        title="Create Division"
        content={`Are you sure you want to create Division ${formik.values.name}?`}
        action={
          <Button
            variant="contained"
            loading={isLoading}
            onClick={saveDivision}
            startIcon={<AcademicFormActionIcon action="confirm" />}
          >
            Confirm
          </Button>
        }
      />
      <DialogScrollContent>
        <Stack spacing={2} sx={academicValidationStyles}>
          <TextField
            autoFocus
            required
            fullWidth
            size="small"
            name="name"
            inputRef={nameInputRef}
            label="Division Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={
              formik.touched.name && formik.errors.name ? formik.errors.name : namePreview
            }
            disabled={isLoading}
          />
          <TextField
            required
            fullWidth
            size="small"
            name="strength"
            label="Strength"
            type="number"
            value={formik.values.strength}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.strength && Boolean(formik.errors.strength)}
            helperText={formik.touched.strength && formik.errors.strength}
            disabled={isLoading}
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          size="small"
          onClick={handleClose}
          disabled={isLoading}
          startIcon={<AcademicFormActionIcon action="cancel" />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          loading={isLoading}
          startIcon={<AcademicFormActionIcon action="submit" />}
          onClick={() => formik.handleSubmit()}
        >
          Submit
        </Button>
      </DialogActions>
    </Box>
  );
}
