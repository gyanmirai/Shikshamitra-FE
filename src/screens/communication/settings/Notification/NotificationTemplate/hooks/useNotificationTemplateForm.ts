import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { debounce } from 'lodash';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useAddNotificationTemplateMutation,
  useUpdateNotificationTemplateMutation,
} from 'src/redux/communication/notification/notificationTemplateApi';

import { notificationTemplateValidationSchema } from '../Components/notificationTemplateValidation';
import { getNotificationTemplateInitialValues } from '../Components/getNotificationTemplateInitialValues';

import type { INotificationTemplate, INotificationTemplateFormValues } from '../types';

interface UseNotificationTemplateFormProps {
  onClose: (event: any, isSubmit?: boolean) => void;
  editData?: INotificationTemplate | null;
}

export const useNotificationTemplateForm = ({
  onClose,
  editData,
}: UseNotificationTemplateFormProps) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const [tag, setTag] = useState('');

  const [addNotificationTemplate, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddNotificationTemplateMutation,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });

  const [updateNotificationTemplate, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateNotificationTemplateMutation,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });

  const { data: roleOptions, isLoading: roleLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });

  const handleSubmit = async (values: INotificationTemplateFormValues) => {
    try {
      const roleId = roleOptions?.items?.find((r: any) => r.name === values.targetRole)?.id;

      const payloadData = {
        templateName: values.templateName,
        role: roleId,
        subject: values.subject,
        message: values.message,
        tags: values.hashtags,
      };

      if (editData) {
        const payload = {
          academicMediumId: (currentMedium as Medium).id,
          id: editData.id,
          data: payloadData,
        };
        await updateNotificationTemplate(payload).unwrap();
        shikshaMitraToast.success({
          message: `"${values.templateName}" Template updated successfully`,
        });
      } else {
        const payload = {
          academicMediumId: (currentMedium as Medium).id,
          data: payloadData,
        };
        await addNotificationTemplate(payload).unwrap();
        shikshaMitraToast.success({
          message: `"${values.templateName}" Template added successfully`,
        });
      }
      onClose(null, true);
    } catch (error) {
      console.error('Failed to save template', error);
      shikshaMitraToast.error({
        message: 'Failed to save template',
      });
    }
  };

  const formik = useFormik<INotificationTemplateFormValues>({
    initialValues: getNotificationTemplateInitialValues(editData),
    validationSchema: notificationTemplateValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  /**
   * Memoization Justification:
   * Debounced function to prevent excessive updates to formik state while typing in the editor.
   * Only recreated if setFieldValue changes (stable).
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleEditorChange = useCallback(
    debounce((value: string) => {
      formik.setFieldValue('message', value);
    }, 300),
    []
  );

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = tag.trim();
      if (trimmed && !formik.values.hashtags.includes(trimmed)) {
        formik.setFieldValue('hashtags', [...formik.values.hashtags, trimmed]);
        setTag('');
      }
    }
  };

  const handleDeleteTag = (deleteTag: string) => {
    formik.setFieldValue(
      'hashtags',
      formik.values.hashtags.filter((t) => t !== deleteTag)
    );
  };

  return {
    formik,
    tag,
    setTag,
    roleOptions: roleOptions?.items || [],
    roleLoading,
    isSubmitting: isAddLoading || isUpdateLoading,
    handleEditorChange,
    handleTagKeyDown,
    handleDeleteTag,
  };
};
