'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { Box, Stack, Skeleton } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
import { StudentFeedback } from 'src/components/student-feedback';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetAdmissionFormQuery,
  useLazyGetAdmissionFormOptionsQuery,
} from 'src/redux/student/admissions/admission-forms-api';

import { FormPreviewContent } from './form-preview/form-preview-content';
import { academicOptionsJson, isInstituteAcademicSource } from './admission-academic-options';
import { buildDynamicAdmissionYupSchema } from './admission-form-validation';
import { getAdmissionFormPreviewInitialValues } from './form-preview/form-preview-model';

export default function AdmissionFormPreviewScreen() {
  const { id } = useParams<{ id: string }>();
  const { data: form, isLoading, isError } = useGetAdmissionFormQuery(id);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [loadOptions] = useLazyGetAdmissionFormOptionsQuery();
  const initialValues = useMemo(() => getAdmissionFormPreviewInitialValues(form), [form]);
  const validationSchema = useMemo(
    () => (form ? buildDynamicAdmissionYupSchema(form) : undefined),
    [form]
  );
  const formik = useFormik<Record<string, string>>({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async () => undefined,
  });
  const [resolvedOptions, setResolvedOptions] = useState<Record<string, string>>({});
  const optionRequests = useMemo(
    () =>
      form?.sections
        .flatMap((section) => section.fields)
        .flatMap((field) => {
          const source = parseOptionsSource(field.optionsJson);
          return source && source.source !== 'StudentSiblings' && !isInstituteAcademicSource(academicOptionsJson(field))
            ? [
                {
                  code: field.code,
                  sourceKey: source.source,
                  parentId: source.parentField ? formik.values[source.parentField] : undefined,
                  academicYearId: currentYear?.id,
                },
              ]
            : [];
        }) ?? [],
    [currentYear?.id, form, formik.values]
  );
  const optionRequestKey = JSON.stringify(optionRequests);

  useEffect(() => {
    if (!form) return undefined;
    let cancelled = false;
    Promise.all(
      optionRequests.map(async (request) => {
        try {
          const options = await loadOptions({
            sourceKey: request.sourceKey,
            parentId: request.parentId,
            academicYearId: request.academicYearId,
          }).unwrap();
          return [
            request.code,
            JSON.stringify(options.filter((option) => option.isActive)),
          ] as const;
        } catch {
          return [request.code, '[]'] as const;
        }
      })
    ).then((entries) => {
      if (!cancelled) setResolvedOptions(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
    // The key captures both source descriptors and their dependent values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionRequestKey]);

  if (isLoading)
    return (
      <Stack spacing={2}>
        <Skeleton height={80} />
        <Skeleton variant="rounded" height={360} />
      </Stack>
    );
  if (isError || !form)
    return (
      <StudentFeedback notificationKey="STU-0066" presentation="toast" severity="error">
        Unable to load form preview.
      </StudentFeedback>
    );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading={`${form.name} preview`}
        description="Preview the form layout and applicant fields."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Settings', href: studentPaths.enrollment.settings.root },
          { name: 'Admission Form', href: studentPaths.enrollment.settings.forms },
          { name: 'Preview' },
        ]}
        sx={{ mb: 1 }}
      />
      <FormPreviewContent form={form} formik={formik} resolvedOptions={resolvedOptions} />
    </Box>
  );
}

function parseOptionsSource(
  value?: string | null
): { source: string; parentField?: string } | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as { source?: unknown; parentField?: unknown };
    return typeof parsed?.source === 'string'
      ? {
          source: parsed.source,
          parentField: typeof parsed.parentField === 'string' ? parsed.parentField : undefined,
        }
      : null;
  } catch {
    return null;
  }
}
