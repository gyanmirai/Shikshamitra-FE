import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useBoolean } from 'src/hooks/use-boolean';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useAddMediumMutation, useUpdateMediumMutation } from 'src/redux/medium/mediumApi';

export type MediumFormProps = {
  handleClose: () => void;
  editData: { id: string; name: string } | null;
  boardId: string | number;
};

export function useMediumForm({ handleClose, editData, boardId }: MediumFormProps) {
  const confirm = useBoolean();
  const [addMedium, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddMediumMutation,
    popupConfig: { success: true, successMessage: 'Medium added successfully' },
  });
  const [updateMedium, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateMediumMutation,
    popupConfig: { success: true, successMessage: 'Medium updated successfully' },
  });
  const formik = useFormik({
    initialValues: { medium: editData?.name ?? '' },
    validationSchema: Yup.object({ medium: Yup.string().required('Medium is required') }),
    onSubmit: confirm.onTrue,
  });
  const saveMedium = async () => {
    const body = { name: formik.values.medium, educationBoardId: boardId };
    try {
      if (editData) await updateMedium({ id: editData.id, body }).unwrap();
      else await addMedium(body).unwrap();
      confirm.onFalse();
      handleClose();
    } catch {
      confirm.onFalse();
    }
  };
  return { formik, confirm, saveMedium, isSaving: isLoading || isUpdateLoading };
}
