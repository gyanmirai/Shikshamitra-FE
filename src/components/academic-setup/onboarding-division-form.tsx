'use client';

import { useFormik } from 'formik';
import { capitalize } from 'lodash';
import { useDispatch } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { boardApi } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useAddDivisionMutation } from 'src/redux/division/divisionApi';
import { Box, Stack, Button, TextField, DialogActions } from '@mui/material';

import { ConfirmDialog } from '../confirm-dialog';
import { DialogScrollContent } from '../customDialog';
import { AcademicFormActionIcon } from './academic-form-action-icon';
import { onboardingDivisionInput, onboardingDivisionSchema } from './onboarding-division-model';

export function OnboardingDivisionForm({
  handleClose,
  classId,
}: {
  handleClose: () => void;
  classId: string | number;
}) {
  const dispatch = useDispatch();
  const confirm = useBoolean();
  const [addDivision, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddDivisionMutation,
    popupConfig: { success: true, successMessage: 'Division added successfully' },
  });
  const formik = useFormik({
    initialValues: { name: '', strength: '' },
    validationSchema: onboardingDivisionSchema,
    onSubmit: (_values, helpers) => {
      confirm.onTrue();
      helpers.setSubmitting(false);
    },
  });
  const saveDivision = async () => {
    try {
      await addDivision(onboardingDivisionInput(formik.values, classId)).unwrap();
      dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
      confirm.onFalse();
      handleClose();
    } catch {
      // The shared mutation hook displays the server error and retains these values.
    }
  };

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
        <Stack spacing={2}>
          <TextField
            autoFocus
            required
            fullWidth
            size="small"
            name="name"
            label="Division Name"
            value={formik.values.name}
            onChange={(event) => formik.setFieldValue('name', capitalize(event.target.value))}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
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
