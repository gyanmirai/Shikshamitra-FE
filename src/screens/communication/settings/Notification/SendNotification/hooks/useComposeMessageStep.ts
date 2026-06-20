'use client';

import type { FormikProps } from 'formik';

import { debounce } from 'lodash';
import { useMemo, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetImportanceLevelOptionsQuery } from 'src/redux/communication/setting/importanceLevel';
import { useGetNotificationTemplatesQuery } from 'src/redux/communication/notification/notificationTemplateApi';

import type { INotificationSendSchema } from '../Components/type';

/**
 * Hook: useComposeMessageStep
 * Responsibilities:
 * - Managing notification templates and importance levels fetching
 * - Handling template selection and field synchronization
 * - Providing a debounced editor change handler
 */
export const useComposeMessageStep = (formik: FormikProps<INotificationSendSchema>) => {
  const { data: rawTemplateData, isLoading: isTemplatesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetNotificationTemplatesQuery,
  });

  const { data: importanceData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetImportanceLevelOptionsQuery,
  });

  const { setFieldValue } = formik;

  const templateData = useMemo(() => {
    if (Array.isArray(rawTemplateData)) return rawTemplateData;
    if (Array.isArray((rawTemplateData as any)?.items)) return (rawTemplateData as any).items;
    return [];
  }, [rawTemplateData]);

  /**
   * Memoization Justification:
   * Debounced handler for editor changes.
   * Wrapped in useMemo to ensure the debounced function is stable across renders
   * and properly reacts to changes in formik dependency.
   */
  const handleEditorChange = useMemo(
    () =>
      debounce((value: string) => {
        const trimmedValue = value.replace(/<p>(&nbsp;|\s)*<\/p>/g, '').trim();
        setFieldValue('selectedTemplate.message', trimmedValue);
      }, 300),
    [setFieldValue]
  );

  /**
   * Memoization Justification:
   * Logic for applying a selected template to form fields.
   * Memoizing prevents unnecessary re-renders of the template selector.
   */
  const handleTemplateChange = useCallback(
    (value: any) => {
      formik.setFieldValue('selectedTemplate.id', value?.id ?? '');
      formik.setFieldValue('selectedTemplate.templateName', value?.templateName ?? '');
      formik.setFieldValue('selectedTemplate.subject', value?.subject ?? '');
      formik.setFieldValue('selectedTemplate.message', value?.message ?? value?.body ?? '');
      if (value?.importance_level || value?.importanceLevel) {
        formik.setFieldValue(
          'selectedTemplate.importance_level',
          value.importance_level ?? value.importanceLevel
        );
      }
    },
    [formik]
  );

  return {
    templateData,
    isTemplatesLoading,
    importanceData,
    handleEditorChange,
    handleTemplateChange,
  };
};
