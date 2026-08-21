'use client';

import type { Standards } from 'src/types/school';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type {
  AdmissionOffering,
  AdmissionOfferingValidation,
  AdmissionOfferingWriteInput,
} from 'src/redux/student/admissions/admission-offerings-api';

import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useGetAdmissionFormsQuery } from 'src/redux/student/admissions/admission-forms-api';
import { useGetAdmissionWorkflowsQuery } from 'src/redux/student/admissions/admission-workflows-api';
import { useValidateAdmissionOfferingMutation } from 'src/redux/student/admissions/admission-offerings-api';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { admissionOfferingSchema } from './admission-offering-schema';
import { useAdmissionUnsavedChanges } from './use-admission-unsaved-changes';
import {
  toOfferingWriteInput,
  getAdmissionApiError,
  getOfferingInitialValues,
} from './admission-offering-model';

type Input = {
  open: boolean;
  cycle: AdmissionCycle;
  mode: 'create' | 'edit' | 'clone';
  offering?: AdmissionOffering | null;
  onSave: (values: AdmissionOfferingWriteInput) => Promise<void>;
};

export function useAdmissionOfferingForm({ open, cycle, mode, offering, onSave }: Input) {
  const [readiness, setReadiness] = useState<AdmissionOfferingValidation | null>(null);
  const [validateOffering, { isLoading: validating }] = useValidateAdmissionOfferingMutation();
  const hierarchyQuery = useGetAcademicOrganizationOptionsQuery(
    { academicYearId: cycle.academicYearId },
    { skip: !open, refetchOnMountOrArgChange: true }
  );
  const workflowsQuery = useGetAdmissionWorkflowsQuery(
    { status: 1, maxResultCount: 100, skipCount: 0 },
    { skip: !open, refetchOnMountOrArgChange: true }
  );
  const formsQuery = useGetAdmissionFormsQuery(
    { status: 1, maxResultCount: 100, skipCount: 0 },
    { skip: !open, refetchOnMountOrArgChange: true }
  );

  /**
   * Memoization Justification:
   * - Formik compares initial values on every render when enableReinitialize is enabled.
   * - The object only changes when the detailed offering being edited changes.
   */
  const initialValues = useMemo(() => getOfferingInitialValues(offering), [offering]);
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: admissionOfferingSchema,
    onSubmit: async (values, helpers) => {
      const input = toOfferingWriteInput(values);
      let validated = false;
      try {
        const validation = await validateOffering({
          ...input,
          admissionCycleId: cycle.id,
          excludingOfferingId: mode === 'edit' ? (offering?.id ?? null) : null,
        }).unwrap();
        validated = true;
        setReadiness(validation);
        if (values.isActive && !validation.isValid) return;
        await onSave(input);
        helpers.resetForm();
      } catch (error) {
        if (!validated)
          shikshaMitraToast.error({
            message: getAdmissionApiError(error, 'Unable to validate the offering configuration.'),
          });
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });
  const standardsQuery = useGetClassByMediumQuery(formik.values.mediumId, {
    skip: !open || !formik.values.mediumId,
  });
  useAdmissionUnsavedChanges(open, formik.dirty);

  return {
    formik,
    readiness,
    clearReadiness: () => setReadiness(null),
    hierarchy: hierarchyQuery.data?.items ?? [],
    standards: (standardsQuery.data ?? []) as Standards[],
    workflows: workflowsQuery.data?.items ?? [],
    forms: formsQuery.data?.items ?? [],
    hierarchyLoading: hierarchyQuery.isFetching,
    standardsLoading: standardsQuery.isFetching,
    configurationLoading: workflowsQuery.isFetching || formsQuery.isFetching,
    queryFailed:
      hierarchyQuery.isError ||
      standardsQuery.isError ||
      workflowsQuery.isError ||
      formsQuery.isError,
    validating,
  };
}
