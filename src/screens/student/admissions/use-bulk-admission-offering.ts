'use client';

import type { Standards } from 'src/types/school';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type { BulkAdmissionOfferingResult } from 'src/redux/student/admissions/admission-offerings-api';

import { useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useBulkCreateAdmissionOfferingsMutation } from 'src/redux/student/admissions/admission-offerings-api';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { getAdmissionApiError } from './admission-offering-model';
import { toBulkOfferingInput } from './bulk-admission-offering-model';
import { useAdmissionDefinitionOptions } from './use-admission-definition-options';

import type { BulkOfferingValues } from './bulk-admission-offering-model';

export function useBulkAdmissionOffering(
  cycle: AdmissionCycle,
  open: boolean,
  onComplete: () => void
) {
  const [preview, setPreview] = useState<BulkAdmissionOfferingResult | null>(null);
  const [previewStandards, setPreviewStandards] = useState<Standards[]>([]);
  const [bulkCreate, bulkState] = useBulkCreateAdmissionOfferingsMutation();
  const [loadStandards, standardsState] = useLazyGetClassByMediumQuery();
  const hierarchyQuery = useGetAcademicOrganizationOptionsQuery(
    { academicYearId: cycle.academicYearId },
    { skip: !open }
  );
  const definitionOptions = useAdmissionDefinitionOptions(open);

  const submit = async (values: BulkOfferingValues, previewOnly: boolean) => {
    try {
      const standards = (await loadStandards(values.mediumId, true).unwrap()) as Standards[];
      const result = await bulkCreate({
        admissionCycleId: cycle.id,
        body: toBulkOfferingInput(values, standards, previewOnly),
      }).unwrap();
      if (previewOnly) {
        setPreviewStandards(standards);
        setPreview(result);
      } else {
        shikshaMitraToast.success({
          message: `${result.createdCount} offering${result.createdCount === 1 ? '' : 's'} created`,
        });
        onComplete();
      }
      return result;
    } catch (error) {
      shikshaMitraToast.error({
        message: getAdmissionApiError(error, 'Unable to process admission offerings.'),
      });
      return null;
    }
  };
  const canSaveInactive = Boolean(
    preview?.items.length && preview.items.every((item) => item.canSaveInactive)
  );
  const canActivate = Boolean(
    preview?.items.length && preview.items.every((item) => item.canActivate)
  );

  return {
    preview,
    previewStandards,
    previewOfferings: (values: BulkOfferingValues) => submit({ ...values, isActive: false }, true),
    createOfferings: (values: BulkOfferingValues) => submit(values, false),
    canSaveInactive,
    canActivate,
    clearPreview: () => {
      setPreview(null);
      setPreviewStandards([]);
    },
    loading: bulkState.isLoading || standardsState.isFetching,
    hierarchy: hierarchyQuery.data?.items ?? [],
    hierarchyError: hierarchyQuery.isError,
    hierarchyEmpty: hierarchyQuery.isSuccess && !hierarchyQuery.data?.items?.length,
    retryHierarchy: hierarchyQuery.refetch,
    ...definitionOptions,
    optionsLoading: hierarchyQuery.isFetching,
  };
}
