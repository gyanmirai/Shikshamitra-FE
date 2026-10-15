'use client';

import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { boardApi } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useAddDivisionMutation, useUpdateDivisionMutation } from 'src/redux/division/divisionApi';

import { onboardingDivisionSchema } from './onboarding-division-model';

export type DivisionFormProps = {
  handleClose: () => void;
  classId: string | number;
  editData: {
    id: string;
    name: string;
    strength: number;
    roomId?: string | null;
    roomNumber?: string | null;
  } | null;
  showRoomSelection?: boolean;
};

export function useDivisionForm({
  handleClose,
  editData,
  classId,
  showRoomSelection = true,
}: DivisionFormProps) {
  const confirm = useBoolean();
  const dispatch = useDispatch();
  const [addDivision, { isLoading: isCreating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddDivisionMutation,
    popupConfig: { success: true, successMessage: 'Division added successfully' },
  });
  const [updateDivision, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateDivisionMutation,
    popupConfig: { success: true, successMessage: 'Division updated successfully' },
  });
  const isSaving = isCreating || isUpdating;
  const formik = useFormik({
    initialValues: {
      name: editData?.name ?? '',
      strength: editData?.strength ?? '',
      roomNumber: editData?.roomNumber ?? editData?.roomId ?? '',
    },
    validationSchema: onboardingDivisionSchema,
    onSubmit: (_values, helpers) => {
      confirm.onTrue();
      helpers.setSubmitting(false);
    },
  });
  const saveDivision = async () => {
    if (isSaving) return;
    const body = {
      name: formik.values.name.trim(),
      strength: Number(formik.values.strength),
      standardId: classId,
      ...(showRoomSelection ? { roomNumber: formik.values.roomNumber } : {}),
    };
    try {
      await (editData ? updateDivision({ id: editData.id, body }) : addDivision(body)).unwrap();
      dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
      confirm.onFalse();
      handleClose();
    } catch {
      // The shared mutation hook displays the error while the draft remains available for retry.
    }
  };
  return { formik, confirm, isSaving, saveDivision };
}
