import type { Dispatch, SetStateAction } from 'react';
import type { HrReportSource, HrReportRequest } from 'src/redux/hr/hrReportsApi';

import { useCallback } from 'react';
import {
  useCreateHrReportTemplateMutation,
  useDeleteHrReportTemplateMutation,
  useUpdateHrReportTemplateMutation,
  useDuplicateHrReportTemplateMutation,
} from 'src/redux/hr/hrReportsApi';

import { hrReportToast } from '../hr-report-notifications';
import { createHrReportStateFromSource } from '../hr-report-utils';

import type { HrReportBuilderState } from '../hr-report-types';

type UseHrReportTemplatesInput = {
  source: HrReportSource;
  state: HrReportBuilderState;
  setState: Dispatch<SetStateAction<HrReportBuilderState>>;
  requestFor: (page?: number, pageSize?: number) => HrReportRequest;
};

export function useHrReportTemplates({
  source,
  state,
  setState,
  requestFor,
}: UseHrReportTemplatesInput) {
  const [createTemplate, { isLoading: isCreatingTemplate }] = useCreateHrReportTemplateMutation();
  const [updateTemplate, { isLoading: isUpdatingTemplate }] = useUpdateHrReportTemplateMutation();
  const [duplicateTemplate, { isLoading: isDuplicatingTemplate }] =
    useDuplicateHrReportTemplateMutation();
  const [deleteTemplate, { isLoading: isDeletingTemplate }] = useDeleteHrReportTemplateMutation();

  const saveTemplate = useCallback(
    async (publish = false) => {
      const body = {
        name: state.reportName || source.label,
        category: source.category,
        dataSource: source.id,
        visibility: publish ? 'organization' : state.visibility,
        status: publish ? 'Published' : 'Draft',
        definition: requestFor(),
      };

      if (state.selectedTemplate) {
        const updated = await updateTemplate({ id: state.selectedTemplate.id, body }).unwrap();
        setState((current) => ({ ...current, selectedTemplate: updated }));
        hrReportToast.success('Template updated');
      } else {
        const created = await createTemplate(body).unwrap();
        setState((current) => ({ ...current, selectedTemplate: created }));
        hrReportToast.success('Template saved');
      }
    },
    [createTemplate, requestFor, setState, source, state, updateTemplate]
  );

  const duplicateSelectedTemplate = useCallback(async () => {
    if (!state.selectedTemplate) return;

    const duplicated = await duplicateTemplate(state.selectedTemplate.id).unwrap();
    setState((current) => ({
      ...current,
      selectedTemplate: duplicated,
      reportName: duplicated.name,
    }));
    hrReportToast.success('Template duplicated');
  }, [duplicateTemplate, setState, state.selectedTemplate]);

  const deleteSelectedTemplate = useCallback(async () => {
    if (!state.selectedTemplate) return;

    await deleteTemplate(state.selectedTemplate.id).unwrap();
    setState(createHrReportStateFromSource(source));
    hrReportToast.success('Template deleted');
  }, [deleteTemplate, setState, source, state.selectedTemplate]);

  return {
    saveTemplate,
    duplicateSelectedTemplate,
    deleteSelectedTemplate,
    isSavingTemplate: isCreatingTemplate || isUpdatingTemplate,
    isDuplicatingTemplate,
    isDeletingTemplate,
  };
}
