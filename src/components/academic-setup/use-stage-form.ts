import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { boardApi } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useAddOrganizationMutation,
  useUpdateOrganizationMutation,
} from 'src/redux/oraganization/oraganization';

export type StageFormProps = {
  handleClose: () => void;
  editData: { id: string; name: string } | null;
  mediumId: string;
};

export function useStageForm({ handleClose, editData, mediumId }: StageFormProps) {
  const confirm = useBoolean();
  const dispatch = useDispatch();
  const [addOrganization, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddOrganizationMutation,
    popupConfig: { success: true, successMessage: 'Stage added successfully' },
  });
  const [updateOrganization, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateOrganizationMutation,
    popupConfig: { success: true, successMessage: 'Stage updated successfully' },
  });
  const formik = useFormik({
    initialValues: {
      organization: editData?.name ?? '',
    },
    validationSchema: Yup.object({
      organization: Yup.string().required('Stage name is required'),
    }),
    onSubmit: () => {
      confirm.onTrue();
    },
  });
  const saveStage = async () => {
    const body = {
      name: formik.values.organization,
      educationMediumId: mediumId,
    };
    try {
      if (editData) await updateOrganization({ id: editData.id, body }).unwrap();
      else await addOrganization(body).unwrap();
      dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
      confirm.onFalse();
      handleClose();
    } catch {
      confirm.onFalse();
    }
  };
  return {
    formik,
    confirm,
    saveStage,
    isSaving: isLoading || isUpdateLoading,
  };
}
