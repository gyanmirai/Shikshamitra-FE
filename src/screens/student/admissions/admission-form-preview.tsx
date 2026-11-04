'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionForm,
  AdmissionFormConnectedSource,
} from 'src/redux/student/admissions/admission-forms-api';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import { studentPaths } from 'src/constants/student-menu';
import { StudentFeedback } from 'src/components/student-feedback';
import { Box, Stack, Alert, Button, Skeleton } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  useGetAdmissionFormQuery,
  useLazyGetAdmissionFormOptionsQuery,
  useGetAdmissionFormInheritanceSourcesQuery,
  useGetSavedAdmissionFormInheritancePreviewQuery,
} from 'src/redux/student/admissions/admission-forms-api';

import { getAdmissionFormAccess } from './form-access';
import { FormPreviewContent } from './form-preview/form-preview-content';
import { buildDynamicAdmissionYupSchema } from './admission-form-validation';
import { mergeInquiryContextSections } from './inquiry-context-presentation';
import { getAdmissionFormPreviewInitialValues } from './form-preview/form-preview-model';
import { getAdmissionFormPreviewReturnUrl } from './form-preview/form-preview-navigation';
import { SavedInquirySourcePicker } from './form-dialog/components/inquiry-source-picker';
import { academicOptionsJson, isInstituteAcademicSource } from './admission-academic-options';

export default function AdmissionFormPreviewScreen() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentData: savedForm, isLoading, isError } = useGetAdmissionFormQuery(id);
  const returnUrl = getAdmissionFormPreviewReturnUrl(
    searchParams.get('returnTo'),
    savedForm?.purpose
  );
  const closePreview = () => router.replace(returnUrl);
  const { currentYear, permissions } = useSelector((state: RootState) => ({
    currentYear: state.globalState.currentYear,
    permissions: state.auth.permissions,
  }));
  const inherited = savedForm?.purpose === 1 && savedForm.inheritance?.enabled === true;
  const approvedIds =
    savedForm?.inheritance?.sources.map((source) => source.inquiryFormDefinitionId) ?? [];
  const requestedSource = searchParams.get('inquiryFormDefinitionId');
  const [chosen, setChosen] = useState<{ formId: string; sourceId: string | null } | null>(null);
  useEffect(() => setChosen(null), [id, requestedSource]);
  const candidate =
    chosen?.formId === id
      ? chosen.sourceId
      : (requestedSource ?? (approvedIds.length === 1 ? approvedIds[0] : null));
  const sourceId = candidate && approvedIds.includes(candidate) ? candidate : null;
  const preview = useGetSavedAdmissionFormInheritancePreviewQuery(
    { id, inquiryFormDefinitionId: sourceId ?? '' },
    { skip: !inherited || !sourceId, refetchOnMountOrArgChange: true }
  );
  const [sourcePage, setSourcePage] = useState(0);
  const [sourceMetadata, setSourceMetadata] = useState<{
    formId: string;
    items: AdmissionFormConnectedSource[];
  }>({ formId: id, items: [] });
  const canReadUsage = getAdmissionFormAccess(permissions).canView;
  const sources = useGetAdmissionFormInheritanceSourcesQuery(
    { id, skipCount: sourcePage * 25, maxResultCount: 25 },
    { skip: !inherited || !canReadUsage }
  );
  const sourceBatch = JSON.stringify(sources.currentData ?? null);
  useEffect(() => {
    setSourcePage(0);
    setSourceMetadata({ formId: id, items: [] });
  }, [id]);
  useEffect(() => {
    if (sourceBatch === 'null' || !canReadUsage) return;
    const batch = JSON.parse(sourceBatch) as { items: AdmissionFormConnectedSource[] };
    setSourceMetadata((current) => ({
      formId: id,
      items: [
        ...new Map(
          [...(current.formId === id ? current.items : []), ...batch.items].map((source) => [
            source.inquiryFormDefinitionId,
            source,
          ])
        ).values(),
      ],
    }));
  }, [sourceBatch, id, canReadUsage]);
  const sourceChoices = approvedIds.map((source, index) => {
    const metadata =
      sourceMetadata.formId === id
        ? sourceMetadata.items.find((item) => item.inquiryFormDefinitionId === source)
        : undefined;
    return metadata
      ? { id: source, name: metadata.name, version: metadata.version }
      : {
          id: source,
          name: `Saved Inquiry ${index + 1}`,
          version: 0,
          savedLabel: `Saved Inquiry ${index + 1}`,
        };
  });
  const resolved =
    inherited &&
    sourceId &&
    preview.currentData?.inquiryFormDefinitionId === sourceId &&
    preview.currentData.isValid
      ? preview.currentData
      : undefined;
  const form: AdmissionForm | undefined = useMemo(
    () =>
      inherited
        ? resolved
          ? {
              ...resolved.definition,
              sections: mergeInquiryContextSections(
                resolved.definition.sections,
                resolved.inquiryContextSections
              ),
            }
          : undefined
        : savedForm,
    [inherited, resolved, savedForm]
  );
  const loadingComposition = Boolean(
    inherited &&
    sourceId &&
    (preview.isLoading || preview.isFetching || (!preview.currentData && !preview.isError))
  );
  const compositionFailed = Boolean(
    inherited && sourceId && !loadingComposition && (!resolved || preview.isError)
  );
  const [loadOptions] = useLazyGetAdmissionFormOptionsQuery();
  const initialValues = useMemo(() => getAdmissionFormPreviewInitialValues(form), [form]);
  const validationSchema = useMemo(
    () =>
      inherited
        ? resolved
          ? buildDynamicAdmissionYupSchema(resolved.definition)
          : undefined
        : savedForm
          ? buildDynamicAdmissionYupSchema(savedForm)
          : undefined,
    [inherited, resolved, savedForm]
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
        heading={savedForm ? `${savedForm.name} Preview` : 'Form Preview'}
        description="Preview the Form Layout and Applicant Fields."
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
      {inherited && (
        <Stack spacing={1}>
          <SavedInquirySourcePicker
            sources={sourceChoices}
            sourceId={sourceId}
            loading={sources.isFetching}
            onChange={(next) => {
              setChosen({ formId: id, sourceId: next });
              const query = new URLSearchParams(searchParams.toString());
              if (next) query.set('inquiryFormDefinitionId', next);
              else query.delete('inquiryFormDefinitionId');
              router.replace(
                `${studentPaths.enrollment.settings.forms}/${encodeURIComponent(id)}/preview${query.size ? `?${query}` : ''}`,
                { scroll: false }
              );
            }}
          />
          {canReadUsage && sourceMetadata.items.length < (sources.currentData?.totalCount ?? 0) && (
            <Button
              size="small"
              disabled={sources.isFetching}
              onClick={() => setSourcePage((page) => page + 1)}
            >
              Load More Inquiry Versions
            </Button>
          )}
          {canReadUsage && sources.isError && (
            <Alert
              severity="warning"
              action={
                <Button size="small" color="inherit" onClick={() => sources.refetch()}>
                  Retry Source Names
                </Button>
              }
            >
              Source names could not load. Saved approved Inquiry versions remain selectable.
            </Alert>
          )}
        </Stack>
      )}
      {isLoading || (!savedForm && !isError) || loadingComposition ? (
        <Stack spacing={2} aria-label="Loading Form Preview" aria-busy="true">
          <Skeleton variant="rounded" height={360} />
        </Stack>
      ) : isError || !savedForm ? (
        <StudentFeedback notificationKey="STU-0066" presentation="toast" severity="error">
          Unable to load form preview.
        </StudentFeedback>
      ) : inherited && !sourceId ? (
        <Alert severity="info">
          {approvedIds.length
            ? 'Choose an Approved Inquiry Form to Preview This Registration.'
            : 'This Registration Has No Approved Inquiry Form to Preview.'}
        </Alert>
      ) : compositionFailed ? (
        <Alert
          severity="error"
          action={
            <Button size="small" color="inherit" onClick={() => preview.refetch()}>
              Retry Preview
            </Button>
          }
        >
          Unable to load the saved Inquiry questions. Retry the preview.
        </Alert>
      ) : form ? (
        <FormPreviewContent form={form} formik={formik} resolvedOptions={resolvedOptions} />
      ) : null}
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
