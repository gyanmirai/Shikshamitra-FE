'use client';

import { useState } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetAdmissionFormQuery } from 'src/redux/student/admissions/admission-forms-api';
import {
  useGetAdmissionOfferingQuery,
  useGetAdmissionOfferingsQuery,
} from 'src/redux/student/admissions/admission-offerings-api';
import {
  type DuplicateMatch,
  useCreateAdmissionInquiryMutation,
  useCheckAdmissionInquiryDuplicatesMutation,
} from 'src/redux/student/admissions/admission-inquiries-api';

import {
  validateAdmissionInquiry,
  getAdmissionInquiryFields,
  buildAdmissionInquiryPayload,
  initialAdmissionInquiryValues,
  buildAdmissionInquiryDuplicateInput,
} from './admission-inquiry-model';

export function useAdmissionInquiryDialog(onClose: () => void) {
  const [matches, setMatches] = useState<DuplicateMatch[]>([]);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [duplicateOverrideReason, setDuplicateOverrideReason] = useState('');
  const [create, createState] = useCreateAdmissionInquiryMutation();
  const [checkDuplicates, duplicateState] = useCheckAdmissionInquiryDuplicatesMutation();
  const formik = useFormik({
    initialValues: initialAdmissionInquiryValues,
    validate: (values) => validateAdmissionInquiry(values, fields),
    onSubmit: async (values) => {
      setRequestError(null);
      try {
        const result = await checkDuplicates(
          buildAdmissionInquiryDuplicateInput(values, fields)
        ).unwrap();
        setMatches(result);
        if (!result.length) await submit();
      } catch (error) {
        const message = parseApiProblemDetail(error).detail || 'Duplicate check failed';
        setRequestError(message);
        shikshaMitraToast.error({ message });
      }
    },
  });
  const { data: offerings, isFetching: offeringsLoading } = useGetAdmissionOfferingsQuery(
    {
      admissionCycleId: formik.values.cycleId,
      availabilityStatus: 2,
      maxResultCount: 100,
      skipCount: 0,
    },
    { skip: !formik.values.cycleId }
  );
  const { data: offeringDetail } = useGetAdmissionOfferingQuery(formik.values.offeringId, {
    skip: !formik.values.offeringId,
  });
  const { data: form, isFetching: formLoading } = useGetAdmissionFormQuery(
    offeringDetail?.inquiryFormDefinitionId ?? '',
    { skip: !offeringDetail?.inquiryFormDefinitionId }
  );
  const fields = getAdmissionInquiryFields(form);

  async function submit(existingFamilyId?: string | null, createSeparateFamily = false) {
    setRequestError(null);
    try {
      await create(
        buildAdmissionInquiryPayload(
          formik.values,
          fields,
          existingFamilyId,
          createSeparateFamily,
          duplicateOverrideReason
        )
      ).unwrap();
      shikshaMitraToast.success({ message: 'Inquiry created' });
      onClose();
    } catch (error) {
      const message = parseApiProblemDetail(error).detail || 'Unable to create inquiry';
      setRequestError(message);
      shikshaMitraToast.error({ message });
    }
  }

  return {
    formik,
    fields,
    matches,
    requestError,
    duplicateOverrideReason,
    setDuplicateOverrideReason,
    offerings: offerings?.items ?? [],
    offeringsLoading,
    formLoading,
    busy: createState.isLoading || duplicateState.isLoading,
    useExistingFamily: async (familyId: string) => {
      setMatches([]);
      await submit(familyId);
    },
    createSeparateFamily: async () => {
      setMatches([]);
      await submit(null, true);
    },
  };
}
