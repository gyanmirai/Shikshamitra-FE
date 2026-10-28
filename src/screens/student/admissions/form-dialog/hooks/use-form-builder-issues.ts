import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useGetAdmissionFormSystemFieldsQuery } from 'src/redux/student/admissions/admission-forms-api';

import { getBuilderIssues } from '../form-builder-issues';

export function useFormBuilderIssues(form: CreateUpdateAdmissionForm) {
  const hasLinkedFields = form.sections.some((section) =>
    section.fields.some((field) => field.bindingType === 0 && field.fieldType !== 12)
  );
  const catalogue = useGetAdmissionFormSystemFieldsQuery(undefined, { skip: !hasLinkedFields });
  return getBuilderIssues(form, {
    fields: catalogue.data,
    isLoading: catalogue.isLoading,
    isError: catalogue.isError,
  });
}
