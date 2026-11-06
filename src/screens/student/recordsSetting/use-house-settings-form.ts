import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import base64ToFile from 'src/utils/base64ToFile';
import { fileToBase64 } from 'src/utils/file-to-base64';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';
import {
  useAddStudentGroupMutation,
  useUpdateStudentGroupMutation,
} from 'src/redux/student/student-group/student-group';

import type { IGroup } from './type';

export type HouseSettingsFormProps = {
  record: IGroup | null;
  mediumId: string;
  onClose: () => void;
};

export function useHouseSettingsForm({ record, mediumId, onClose }: HouseSettingsFormProps) {
  const router = useRouter();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canWrite = hasGrantedPermission(permissions, 'Students.Records.Settings.Add');
  const [add, addState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentGroupMutation,
    popupConfig: { error: false },
  });
  const [update, updateState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentGroupMutation,
    popupConfig: { error: false },
  });
  const [initialValues] = useState(() => ({
    name: record?.name ?? '',
    color: record?.color ?? '#000000',
    description: record?.description ?? '',
    logoUrl:
      typeof record?.logoUrl === 'string'
        ? base64ToFile(record.logoUrl)
        : (record?.logoUrl ?? null),
  }));
  const form = useFormik({
    initialValues,
    validationSchema: Yup.object({
      name: Yup.string().trim().required('House name is required.'),
      color: Yup.string().required('Choose a house color.'),
    }),
    onSubmit: async (values) => {
      if (!canWrite || !mediumId) return;
      try {
        const logo =
          values.logoUrl instanceof File
            ? (await fileToBase64(values.logoUrl)).split(',')[1]
            : undefined;
        const body = {
          name: values.name,
          color: values.color,
          description: values.description,
          ...(logo ? { logo } : {}),
        };
        if (record) await update({ houseSettingId: record.id, body }).unwrap();
        else await add({ academicMediumId: mediumId, body }).unwrap();
        shikshaMitraToast.success({ message: record ? 'House updated.' : 'House added.' });
        onClose();
      } catch (error) {
        shikshaMitraToast.error({
          message:
            parseApiProblemDetail(error).detail ||
            'The house could not be saved. Your changes are kept.',
        });
      }
    },
  });
  const busy = addState.isLoading || updateState.isLoading || form.isSubmitting;
  const guard = useUnsavedNavigation(form.dirty, {
    push: router.push,
    blockNavigation: busy,
    guardContextChanges: true,
    renderConfirmation: (keepEditing, discard) =>
      renderUnsavedConfirmation(keepEditing, discard, { busy }),
  });
  return {
    form,
    busy,
    canWrite,
    close: () => guard.requestNavigation(onClose),
    confirmation: guard.confirmation,
  };
}
