'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { boardApi } from 'src/redux/board/boardApi';
import { capitalizeFirstLetter } from 'src/utils/input-format';
import { useAddClassMutation } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Stack, Button, TextField, DialogActions } from '@mui/material';

import { ConfirmDialog } from '../confirm-dialog';
import { DialogScrollContent } from '../customDialog';
import { standardNameSchema } from './standard-form-model';
import { academicValidationStyles } from './academic-form-styles';
import { AcademicFormActionIcon } from './academic-form-action-icon';

import type { ExistingStandard } from './standard-form-model';

type OnboardingStandardFormProps = {
  handleClose: () => void;
  organizationId: string | number;
  existingStandards?: ExistingStandard[];
};

export const OnboardingStandardForm = ({
  handleClose,
  organizationId,
  existingStandards,
}: OnboardingStandardFormProps) => {
  const dispatch = useDispatch();
  const confirm = useBoolean();
  const [addClass, { isLoading: isCreating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddClassMutation,
    popupConfig: { success: true, successMessage: 'Class added successfully' },
  });
  const formik = useFormik({
    initialValues: { name: '', ageLowerLimit: '' },
    validationSchema: Yup.object({
      name: standardNameSchema(existingStandards),
      ageLowerLimit: Yup.number()
        .typeError('Limit of Age must be a number')
        .integer('Limit of Age must be an integer')
        .positive('Limit of Age must be positive')
        .required('Limit of Age is required'),
    }),
    onSubmit: (_values, helpers) => {
      confirm.onTrue();
      helpers.setSubmitting(false);
    },
  });
  const saveStandard = async () => {
    const { values } = formik;
    const body = {
      name: values.name.trim(),
      ageLowerLimit: Number(values.ageLowerLimit),
      educationMediumStageId: organizationId,
    };
    try {
      await addClass(body).unwrap();
      dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
      confirm.onFalse();
      handleClose();
    } catch (error) {
      const problem = parseApiProblemDetail(error);
      if (problem.errorCode === 'ShikshaMitra.TenantSettings:DuplicateStandardName') {
        confirm.onFalse();
        formik.setFieldError('name', problem.detail);
        formik.setFieldTouched('name', true, false);
      }
    }
  };
  const isSaving = isCreating || formik.isSubmitting;
  return (
    <>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Create Standard"
        content={`Are you sure you want to create Standard ${formik.values.name}?`}
        action={
          <LoadingButton
            variant="contained"
            loading={isSaving}
            onClick={saveStandard}
            startIcon={<AcademicFormActionIcon action="confirm" />}
          >
            Confirm
          </LoadingButton>
        }
      />
      <DialogScrollContent>
        <Stack spacing={2} sx={academicValidationStyles}>
          <TextField
            autoFocus
            required
            fullWidth
            name="name"
            label="Class Name"
            value={formik.values.name}
            onChange={(event) =>
              formik.setFieldValue('name', capitalizeFirstLetter(event.target.value))
            }
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            size="small"
            disabled={isSaving}
          />
          <TextField
            required
            fullWidth
            name="ageLowerLimit"
            label="Limit Of Age"
            type="number"
            value={formik.values.ageLowerLimit}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.ageLowerLimit && Boolean(formik.errors.ageLowerLimit)}
            helperText={formik.touched.ageLowerLimit && formik.errors.ageLowerLimit}
            size="small"
            disabled={isSaving}
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
        <LoadingButton
          variant="contained"
          size="small"
          loading={isSaving}
          startIcon={<AcademicFormActionIcon action="submit" />}
          onClick={() => formik.handleSubmit()}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};
