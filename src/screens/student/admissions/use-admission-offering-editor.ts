'use client';

import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type {
  AdmissionOffering,
  AdmissionOfferingValidation,
  AdmissionOfferingWriteInput,
} from 'src/redux/student/admissions/admission-offerings-api';

import { useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useValidateAdmissionOfferingMutation } from 'src/redux/student/admissions/admission-offerings-api';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { useAdmissionDefinitionOptions } from './use-admission-definition-options';
import { toOfferingWriteInput, getAdmissionApiError } from './admission-offering-model';

import type { AdmissionOfferingFormValues } from './admission-offering-model';

type Input = {
  open: boolean;
  cycle: AdmissionCycle;
  offering: AdmissionOffering;
  onSave: (values: AdmissionOfferingWriteInput, admissionCycleId: string) => Promise<void>;
};

export function useAdmissionOfferingEditor({ open, cycle, offering, onSave }: Input) {
  const [readiness, setReadiness] = useState<AdmissionOfferingValidation | null>(null);
  const [validateOffering, validationState] = useValidateAdmissionOfferingMutation();
  const hierarchyQuery = useGetAcademicOrganizationOptionsQuery(
    { academicYearId: cycle.academicYearId },
    { skip: !open, refetchOnMountOrArgChange: true }
  );
  const definitionOptions = useAdmissionDefinitionOptions(open);

  const validateForReview = async (values: AdmissionOfferingFormValues) => {
    try {
      const validation = await validateOffering({
        ...toOfferingWriteInput(values),
        admissionCycleId: cycle.id,
        excludingOfferingId: offering.id,
      }).unwrap();
      setReadiness(validation);
      return validation;
    } catch (error) {
      shikshaMitraToast.error({
        message: getAdmissionApiError(error, 'Unable to validate the offering configuration.'),
      });
      return null;
    }
  };

  const save = async (values: AdmissionOfferingFormValues) => {
    const validation = await validateForReview(values);
    if (!validation || (values.isActive && !validation.isValid)) return false;
    await onSave(toOfferingWriteInput(values), cycle.id);
    return true;
  };

  const hierarchy = hierarchyQuery.data?.items ?? [];

  return {
    readiness,
    validateForReview,
    save,
    clearReadiness: () => setReadiness(null),
    hierarchy,
    hierarchyEmpty: !hierarchyQuery.isFetching && !hierarchyQuery.isError && hierarchy.length === 0,
    hierarchyLoading: hierarchyQuery.isFetching,
    queryFailed: hierarchyQuery.isError,
    validating: validationState.isLoading,
    ...definitionOptions,
  };
}
