'use client';

import { useRef } from 'react';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { boardApi } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { duplicateDivisionCode } from 'src/utils/duplicate-division-error';
import { useAddDivisionMutation, useUpdateDivisionMutation } from 'src/redux/division/divisionApi';

import { divisionFormSchema, onboardingDivisionInput } from './onboarding-division-model';

import type { ExistingDivision } from './onboarding-division-model';

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
  existingDivisions?: ExistingDivision[];
};

export function useDivisionForm({
  handleClose,
  editData,
  classId,
  showRoomSelection = true,
  existingDivisions,
}: DivisionFormProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
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
    validationSchema: divisionFormSchema(existingDivisions, editData?.id),
    onSubmit: (_values, helpers) => {
      confirm.onTrue();
      helpers.setSubmitting(false);
    },
  });
  const saveDivision = async () => {
    if (isSaving) return;
    const body = {
      ...onboardingDivisionInput(formik.values, classId),
      ...(showRoomSelection ? { roomNumber: formik.values.roomNumber } : {}),
    };
    try {
      await (editData ? updateDivision({ id: editData.id, body }) : addDivision(body)).unwrap();
      dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
      confirm.onFalse();
      handleClose();
    } catch (error) {
      const problem = parseApiProblemDetail(error);
      if (problem.errorCode === duplicateDivisionCode) {
        confirm.onFalse();
        formik.setFieldError('name', problem.detail);
        formik.setFieldTouched('name', true, false);
        requestAnimationFrame(() => nameInputRef.current?.focus());
      }
    }
  };
  return { formik, confirm, isSaving, saveDivision, nameInputRef };
}
