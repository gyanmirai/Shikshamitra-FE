import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { useMemo } from 'react';
import { useFormik } from 'formik';
import { Scrollbar } from 'src/components/scrollbar';
import { StudentFeedback } from 'src/components/student-feedback';

import { getAddressBuilderIssues } from '../form-builder-issues';
import { FormPreviewContent } from '../../form-preview/form-preview-content';
import { buildDynamicAdmissionYupSchema } from '../../admission-form-validation';
import { getAdmissionFormPreviewInitialValues } from '../../form-preview/form-preview-model';

export function getLivePreviewForm(form: CreateUpdateAdmissionForm): AdmissionForm {
  return {
    ...form,
    concurrencyStamp: form.concurrencyStamp ?? undefined,
    id: 'builder-preview',
    version: 1,
    status: 0 as const,
    sectionCount: form.sections.length,
  };
}

export function FormBuilderLivePreview({ form }: { form: CreateUpdateAdmissionForm }) {
  const previewForm = useMemo(() => getLivePreviewForm(form), [form]);
  const initialValues = useMemo(
    () => getAdmissionFormPreviewInitialValues(previewForm),
    [previewForm]
  );
  const validationSchema = useMemo(
    () => buildDynamicAdmissionYupSchema(previewForm),
    [previewForm]
  );
  const formik = useFormik<Record<string, string>>({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async () => undefined,
  });
  const addressIssues = [...new Set(getAddressBuilderIssues(form).map((issue) => issue.message))];
  return (
    <Scrollbar sx={{ height: 1, minHeight: 0, p: { xs: 1, sm: 2 } }}>
      {addressIssues.length > 0 && (
        <StudentFeedback notificationKey="STU-0366" presentation="inline" severity="warning" sx={{ mb: 1 }}>
          {addressIssues.join(' ')}
        </StudentFeedback>
      )}
      <FormPreviewContent
        form={previewForm}
        formik={formik}
        resolvedOptions={{}}
        embedded
        preview
      />
    </Scrollbar>
  );
}
