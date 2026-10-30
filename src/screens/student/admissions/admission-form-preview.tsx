'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import { studentPaths } from 'src/constants/student-menu';
import { Box, Stack, Button, Skeleton } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  useGetAdmissionFormQuery,
  useLazyGetAdmissionFormOptionsQuery,
} from 'src/redux/student/admissions/admission-forms-api';

import { FormPreviewContent } from './form-preview/form-preview-content';
import { buildDynamicAdmissionYupSchema } from './admission-form-validation';
import { getAdmissionFormPreviewInitialValues } from './form-preview/form-preview-model';
import { getAdmissionFormPreviewReturnUrl } from './form-preview/form-preview-navigation';
import { academicOptionsJson, isInstituteAcademicSource } from './admission-academic-options';

export default function AdmissionFormPreviewScreen() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: form, isLoading, isError } = useGetAdmissionFormQuery(id);
  const returnUrl = getAdmissionFormPreviewReturnUrl(searchParams.get('returnTo'), form?.purpose);
  const closePreview = () => router.replace(returnUrl);
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
          return source &&
            source.source !== 'StudentSiblings' &&
            !isInstituteAcademicSource(academicOptionsJson(field))
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading={form ? `${form.name} preview` : 'Form Preview'}
        description="Preview the form layout and applicant fields."
        isBack
        onBack={closePreview}
        action={
          <Button
            type="button"
            size="small"
            color="inherit"
            variant="outlined"
            onClick={closePreview}
          >
            Back to Forms
          </Button>
        }
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Settings', href: studentPaths.enrollment.settings.root },
          { name: 'Admission Form', href: returnUrl },
          { name: 'Preview' },
        ]}
      />
      {isLoading ? (
        <Stack spacing={2} aria-label="Loading form preview" aria-busy="true">
          <Skeleton variant="rounded" height={360} />
        </Stack>
      ) : isError || !form ? (
        <StudentFeedback notificationKey="STU-0066" presentation="toast" severity="error">
          Unable to load form preview.
        </StudentFeedback>
      ) : (
        <FormPreviewContent form={form} formik={formik} resolvedOptions={resolvedOptions} />
      )}
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
