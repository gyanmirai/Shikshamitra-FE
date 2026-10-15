import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { boardApi } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useAddClassMutation, useUpdateClassMutation } from 'src/redux/class/classApi';

import { standardNameSchema } from './standard-form-model';

import type { StandardFormProps } from './standard-form-model';

export function useStandardForm({
  handleClose,
  editData,
  organizationId,
  existingStandards,
}: StandardFormProps) {
  const dispatch = useDispatch();
  const confirm = useBoolean();
  const [addClass, { isLoading: isCreating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddClassMutation,
    popupConfig: { success: true, successMessage: 'Class added successfully' },
  });
  const [updateClass, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateClassMutation,
    popupConfig: { success: true, successMessage: 'Class updated successfully' },
  });
  const formik = useFormik({
    initialValues: {
      name: editData?.name ?? '',
      ageLowerLimit: editData?.ageLowerLimit ?? '',
      shiftId: editData?.shiftId ?? '',
    },
    validationSchema: Yup.object({
      name: standardNameSchema(existingStandards, editData?.id),
      ageLowerLimit: Yup.number()
        .typeError('Limit of Age must be a number')
        .integer('Limit of Age must be an integer')
        .positive('Limit of Age must be positive')
        .required('Limit of Age is required'),
      shiftId: Yup.string().nullable(),
    }),
    onSubmit: (_values, helpers) => {
      confirm.onTrue();
      helpers.setSubmitting(false);
    },
  });
  const saveStandard = async () => {
    if (isCreating || isUpdating) return;
    const body = {
      name: formik.values.name.trim(),
      ageLowerLimit: Number(formik.values.ageLowerLimit),
      educationMediumStageId: organizationId,
      shiftId: formik.values.shiftId || null,
    };
    try {
      await (editData ? updateClass({ id: editData.id, body }) : addClass(body)).unwrap();
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
  return { formik, confirm, saveStandard, isSaving: isCreating || isUpdating };
}
