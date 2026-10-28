import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';
import type { AdmissionInquiryCaptureCatalogueQuery } from 'src/redux/student/admissions/admission-inquiries-api';

import { uuidv4 } from 'src/utils/uuidv4';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useLazyGetAdmissionInquiryCaptureCatalogueQuery } from 'src/redux/student/admissions/admission-inquiries-api';

import { getAdmissionInquiryAcademicOptions } from './admission-inquiry-model';

type Scope = Required<
  Omit<AdmissionInquiryCaptureCatalogueQuery, 'academicYearId' | 'availabilityCheckId'>
> & {
  academicYearId?: string;
};
const EMPTY: AdmissionOfferingListItem[] = [];

export const isInquiryOfferingOpen = (offering: AdmissionOfferingListItem) =>
  offering.availabilityStatus === 2 &&
  offering.configurationStatus === 1 &&
  offering.entryMode !== 1;

export function getInquiryOfferingUnavailableReason(offerings: AdmissionOfferingListItem[]) {
  if (offerings.some(isInquiryOfferingOpen)) return undefined;
  if (!offerings.length)
    return 'No inquiry offering is configured for the selected class and admission period.';
  const reasons = offerings.map((offering) => {
    let reason: string;
    if (offering.entryMode === 1) reason = 'This offering accepts direct registration only.';
    else if (offering.availabilityStatus === 4) reason = 'This admission offering is inactive.';
    else if (offering.availabilityStatus === 0 || offering.configurationStatus === 0)
      reason = 'Admission offering setup is incomplete.';
    else if (offering.availabilityStatus === 1) reason = 'Admission has not opened yet.';
    else if (offering.availabilityStatus === 3) reason = 'Admission is closed.';
    else reason = 'This offering is not available for inquiry.';
    return offerings.length === 1 ? reason : `${offering.name || offering.code}: ${reason}`;
  });
  return [...new Set(reasons)].join(' ');
}

/** Read fresh availability for each academic selection; late results cannot replace a newer class. */
export function useAdmissionInquiryClassOfferings(scope: Scope) {
  const [loadCatalogue, latestQuery, { lastArg }] =
    useLazyGetAdmissionInquiryCaptureCatalogueQuery();
  const [attempt, setAttempt] = useState(0);
  const [checkedKey, setCheckedKey] = useState('');
  const complete = Boolean(
    scope.admissionCycleId && scope.boardId && scope.mediumId && scope.standardId
  );
  const selection = JSON.stringify(scope);
  // An A → B → A sequence must not join A's earlier in-flight request.
  // This token only isolates the RTK cache; the endpoint sends academicYearId alone.
  const requestScope = useMemo(
    () => ({
      ...(JSON.parse(selection) as Scope),
      availabilityCheckId: `${attempt}:${uuidv4()}`,
    }),
    [selection, attempt]
  );
  const key = complete ? JSON.stringify(requestScope) : '';
  useEffect(() => {
    if (!key) return undefined;
    let current = true;
    const selected = JSON.parse(key) as AdmissionInquiryCaptureCatalogueQuery;
    // false forces a network check even when this class has a cached response.
    const request = loadCatalogue(selected, false);
    const settled = () => {
      if (current) setCheckedKey(key);
    };
    request.unwrap().then(settled, settled);
    return () => {
      current = false;
    };
  }, [key, loadCatalogue]);
  const checked = Boolean(key && checkedKey === key && JSON.stringify(lastArg) === key);
  const checking = Boolean(key && (!checked || latestQuery.isFetching));
  const error =
    checked &&
    !checking &&
    (latestQuery.isError || !Array.isArray(latestQuery.currentData?.offerings));
  const matching = useMemo(() => {
    if (!checked || checking || error) return EMPTY;
    return getAdmissionInquiryAcademicOptions(
      latestQuery.currentData!.offerings,
      JSON.parse(selection) as Scope
    ).offerings;
  }, [checked, checking, error, latestQuery.currentData, selection]);
  const offerings = useMemo(() => matching.filter(isInquiryOfferingOpen), [matching]);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return {
    checking,
    error,
    offerings,
    checkedOfferings: matching,
    reason:
      checked && !checking && !error ? getInquiryOfferingUnavailableReason(matching) : undefined,
    retry,
  };
}
