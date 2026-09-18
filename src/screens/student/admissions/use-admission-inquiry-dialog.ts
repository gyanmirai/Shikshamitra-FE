'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetAdmissionFormQuery } from 'src/redux/student/admissions/admission-forms-api';
import { readAdmissionInquiryPolicy } from 'src/redux/student/admissions/admission-inquiry-policy';
import { useGetAdmissionWorkflowQuery } from 'src/redux/student/admissions/admission-workflows-api';
import {
  useGetAdmissionOfferingQuery,
  useGetAdmissionOfferingsQuery,
} from 'src/redux/student/admissions/admission-offerings-api';
import {
  type DuplicateMatch,
  useCreateAdmissionInquiryMutation,
  useCreateAdmissionInquiryCommunicationMutation,
  useCheckAdmissionInquiryDuplicatesMutation,
} from 'src/redux/student/admissions/admission-inquiries-api';

import {
  admissionInquirySchema,
  validateAdmissionInquiry,
  getAdmissionInquiryFields,
  buildAdmissionInquiryPayload,
  initialAdmissionInquiryValues,
  buildAdmissionInquiryDuplicateInput,
} from './admission-inquiry-model';
import { getInquiryCommunicationTemplate } from './inquiry-management/inquiry-communication-templates';

const ALL_INQUIRY_SOURCES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function useAdmissionInquiryDialog(onClose: () => void) {
  const [matches, setMatches] = useState<DuplicateMatch[]>([]);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [duplicateOverrideReason, setDuplicateOverrideReason] = useState('');
  const [create, createState] = useCreateAdmissionInquiryMutation();
  const [createCommunication, communicationState] =
    useCreateAdmissionInquiryCommunicationMutation();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canAutoAcknowledge =
    hasGrantedPermission(permissions, 'Communication.Campaigns.Add') &&
    hasGrantedPermission(permissions, 'Communication.Campaigns.Send');
  const [checkDuplicates, duplicateState] = useCheckAdmissionInquiryDuplicatesMutation();
  const formik = useFormik({
    initialValues: initialAdmissionInquiryValues,
    validationSchema: admissionInquirySchema,
    validate: (values) => validateAdmissionInquiry(values, fields, policy),
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
  const {
    data: offerings,
    isError: offeringsError,
    isFetching: offeringsLoading,
    refetch: retryOfferings,
  } = useGetAdmissionOfferingsQuery(
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
  const { data: workflow, isFetching: workflowLoading } = useGetAdmissionWorkflowQuery(
    offeringDetail?.workflowDefinitionId ?? '',
    { skip: !offeringDetail?.workflowDefinitionId }
  );
  const fields = getAdmissionInquiryFields(form);
  const inquiryStage = workflow?.stages.find((stage) => stage.stageType === 0);
  const policy = readAdmissionInquiryPolicy(inquiryStage?.configurationJson);
  const allowedSources = policy?.allowedSources.length
    ? policy.allowedSources
    : ALL_INQUIRY_SOURCES;

  useEffect(() => {
    if (
      !workflowLoading &&
      allowedSources.length &&
      !allowedSources.includes(formik.values.source)
    ) {
      formik.setFieldValue('source', allowedSources[0], false);
    }
  }, [allowedSources, formik, workflowLoading]);

  async function submit(existingFamilyId?: string | null, createSeparateFamily = false) {
    setRequestError(null);
    try {
      const inquiry = await create(
        buildAdmissionInquiryPayload(
          formik.values,
          fields,
          existingFamilyId,
          createSeparateFamily,
          duplicateOverrideReason
        )
      ).unwrap();
      if (formik.values.sendAcknowledgement && canAutoAcknowledge) {
        const template = getInquiryCommunicationTemplate('acknowledgement', inquiry);
        try {
          const communication = await createCommunication({
            id: inquiry.id,
            body: {
              title: template.title,
              subject: template.subject,
              body: template.body,
              channels: inquiry.email ? [1, 2] : [1],
              importanceLevel: 0,
              requiresAcknowledgement: false,
              publishImmediately: true,
            },
          }).unwrap();
          shikshaMitraToast.success({ message: communication.message });
        } catch (communicationError) {
          shikshaMitraToast.warning({
            message:
              parseApiProblemDetail(communicationError).detail ||
              'Inquiry was created, but the acknowledgement could not be sent.',
          });
        }
      } else {
        shikshaMitraToast.success({ message: 'Inquiry created' });
      }
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
    offeringsError,
    retryOfferings,
    formLoading,
    workflowLoading,
    policy,
    allowedSources,
    sourceDetailRequired: Boolean(policy?.requireSourceDetailFor.includes(formik.values.source)),
    canAutoAcknowledge,
    busy: createState.isLoading || duplicateState.isLoading || communicationState.isLoading,
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
