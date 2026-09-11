'use client';

import type { Standards } from 'src/types/school';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type { BulkAdmissionOfferingResult } from 'src/redux/student/admissions/admission-offerings-api';

import { useState } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useGetAdmissionFormsQuery } from 'src/redux/student/admissions/admission-forms-api';
import { useGetAdmissionWorkflowsQuery } from 'src/redux/student/admissions/admission-workflows-api';
import { useBulkCreateAdmissionOfferingsMutation } from 'src/redux/student/admissions/admission-offerings-api';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { getAdmissionApiError } from './admission-offering-model';
import { useAdmissionUnsavedChanges } from './use-admission-unsaved-changes';
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
  const [bulkCreate, bulkState] = useBulkCreateAdmissionOfferingsMutation();
  const hierarchyQuery = useGetAcademicOrganizationOptionsQuery(
    { academicYearId: cycle.academicYearId },
    { skip: !open }
  );
  const workflowsQuery = useGetAdmissionWorkflowsQuery(
    { status: 1, maxResultCount: 100, skipCount: 0 },
    { skip: !open }
  );
  const formsQuery = useGetAdmissionFormsQuery(
    { status: 1, maxResultCount: 100, skipCount: 0 },
    { skip: !open }
  );
  const formik = useFormik<BulkOfferingValues>({
    initialValues: bulkOfferingInitialValues,
    validationSchema: bulkOfferingSchema,
    onSubmit: async (values) => {
      const standards = (standardsQuery.data ?? []) as Standards[];
      try {
        const result = await bulkCreate({
          admissionCycleId: cycle.id,
          body: toBulkOfferingInput(values, standards, !preview),
        }).unwrap();
        if (!preview) setPreview(result);
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

  return {
    formik,
    preview,
    clearPreview: () => setPreview(null),
    loading: bulkState.isLoading,
    hierarchy: hierarchyQuery.data?.items ?? [],
    standards: (standardsQuery.data ?? []) as Standards[],
    workflows: workflowsQuery.data?.items ?? [],
    forms: formsQuery.data?.items ?? [],
    optionsLoading:
      hierarchyQuery.isFetching ||
      standardsQuery.isFetching ||
      workflowsQuery.isFetching ||
      formsQuery.isFetching,
  };
}
