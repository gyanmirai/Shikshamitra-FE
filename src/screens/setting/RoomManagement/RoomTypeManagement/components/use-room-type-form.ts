import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useAddRoomTypeMutation,
  useUpdateRoomTypeMutation,
} from 'src/redux/InstituteSetup/RoomTypeApi/roomTypeApi';

import type { IRoomType } from '../types';

export type RoomTypeValues = { roomTypeName: string; shortName: string };
export type RoomTypeFormProps = {
  editData: IRoomType | null;
  onClose: (event: unknown, submitted?: boolean) => void;
};

export function useRoomTypeForm({ editData, onClose }: RoomTypeFormProps) {
  const saving = useRef(false);
  const [addRoomType, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddRoomTypeMutation,
  });
  const [updateRoomType, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateRoomTypeMutation,
  });
  const formik = useFormik<RoomTypeValues>({
    initialValues: {
      roomTypeName: editData?.roomTypeName || '',
      shortName: editData?.shortName || '',
    },
    validationSchema: Yup.object().shape({
      roomTypeName: Yup.string().required('Room Type is required'),
      shortName: Yup.string().required('Short Name is required'),
    }),
    async onSubmit(values, helpers) {
      if (saving.current) return;
      saving.current = true;
      helpers.setStatus(undefined);
      try {
        if (editData) {
          await updateRoomType({
            id: editData.id,
            body: { roomTypeName: values.roomTypeName, shortName: values.shortName },
          }).unwrap();
        } else {
          await addRoomType({
            roomTypeName: values.roomTypeName,
            shortName: values.shortName,
          }).unwrap();
        }
        helpers.resetForm({ values });
        shikshaMitraToast.success({
          message: `"${values.roomTypeName}" Room type ${editData ? 'updated' : 'added'} successfully`,
        });
        onClose(null, true);
      } catch (error) {
        helpers.setStatus(
          parseApiProblemDetail(error).detail || 'Unable to save the room type. Try again.'
        );
      } finally {
        saving.current = false;
      }
    },
  });
  useEffect(() => {
    if (!formik.submitCount || formik.isSubmitting || formik.isValid) return;
    const id = formik.errors.roomTypeName ? 'room-type-name' : 'room-type-short-name';
    document.getElementById(id)?.focus();
  }, [formik.submitCount, formik.isSubmitting, formik.isValid, formik.errors.roomTypeName]);
  return { formik, busy: formik.isSubmitting || isLoading || isUpdateLoading };
}
