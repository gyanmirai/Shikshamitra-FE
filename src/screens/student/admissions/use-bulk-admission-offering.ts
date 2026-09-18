'use client';

import type { Standards } from 'src/types/school';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type { BulkAdmissionOfferingResult } from 'src/redux/student/admissions/admission-offerings-api';

import { useRef, useState } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useBulkCreateAdmissionOfferingsMutation } from 'src/redux/student/admissions/admission-offerings-api';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { getAdmissionApiError } from './admission-offering-model';
import { useAdmissionUnsavedChanges } from './use-admission-unsaved-changes';
import { useAdmissionDefinitionOptions } from './use-admission-definition-options';
import {
  bulkOfferingSchema,
  toBulkOfferingInput,
  bulkOfferingInitialValues,
} from './bulk-admission-offering-model';

import type { BulkOfferingValues } from './bulk-admission-offering-model';

export function useBulkAdmissionOffering(
  cycle: AdmissionCycle,
  open: boolean,
  onComplete: () => void
) {
  const [preview, setPreview] = useState<BulkAdmissionOfferingResult | null>(null);
  const [submitIntent, setSubmitIntent] = useState<'preview' | 'inactive' | 'activate' | null>(
    null
  );
  const submitMode = useRef<'preview' | 'inactive' | 'activate'>('preview');
  const [bulkCreate, bulkState] = useBulkCreateAdmissionOfferingsMutation();
  const hierarchyQuery = useGetAcademicOrganizationOptionsQuery(
    { academicYearId: cycle.academicYearId },
    { skip: !open }
  );
  const definitionOptions = useAdmissionDefinitionOptions(open);
  const formik = useFormik<BulkOfferingValues>({
    initialValues: bulkOfferingInitialValues,
    validationSchema: bulkOfferingSchema,
    onSubmit: async (values) => {
      const standards = (standardsQuery.data ?? []) as Standards[];
      const previewOnly = submitMode.current === 'preview';
      const isActive = submitMode.current === 'activate';
      try {
        const result = await bulkCreate({
          admissionCycleId: cycle.id,
          body: toBulkOfferingInput({ ...values, isActive }, standards, previewOnly),
        }).unwrap();
        if (previewOnly) setPreview(result);
        else {
          shikshaMitraToast.success({ message: `${result.createdCount} offerings created` });
          onComplete();
        }
      } catch (error) {
        shikshaMitraToast.error({
          message: getAdmissionApiError(error, 'Unable to process bulk offerings.'),
        });
      }
    },
  });
  const standardsQuery = useGetClassByMediumQuery(formik.values.mediumId, {
    skip: !open || !formik.values.mediumId,
  });
  useAdmissionUnsavedChanges(open, formik.dirty);
  const submit = async (mode: 'preview' | 'inactive' | 'activate') => {
    submitMode.current = mode;
    setSubmitIntent(mode);
    try {
      await formik.setFieldValue('isActive', mode === 'activate', false);
      await formik.submitForm();
    } finally {
      setSubmitIntent(null);
    }
  };
  const canSaveInactive = Boolean(
    preview?.items.length && preview.items.every((item) => item.canSaveInactive)
  );
  const canActivate = Boolean(
    preview?.items.length && preview.items.every((item) => item.canActivate)
  );

  return {
    formik,
    preview,
    submitIntent,
    previewOfferings: () => submit('preview'),
    createInactive: () => submit('inactive'),
    createActive: () => submit('activate'),
    canSaveInactive,
    canActivate,
    clearPreview: () => setPreview(null),
    loading: bulkState.isLoading,
    hierarchy: hierarchyQuery.data?.items ?? [],
    standards: (standardsQuery.data ?? []) as Standards[],
    ...definitionOptions,
    optionsLoading: hierarchyQuery.isFetching || standardsQuery.isFetching,
  };
}
