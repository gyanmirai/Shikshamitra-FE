'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useFormik, type FormikProps } from 'formik';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { DEFAULT_INQUIRY_POLICY, readAdmissionInquiryPolicy } from 'src/redux/student/admissions/admission-inquiry-policy';
import { useGetAdmissionIntakeProfilesQuery } from 'src/redux/student/admissions/admission-intake-profiles-api';
import { useGetAdmissionWorkflowQuery } from 'src/redux/student/admissions/admission-workflows-api';
import {
  type AdmissionFormField,
  useGetAdmissionFormQuery,
} from 'src/redux/student/admissions/admission-forms-api';
import {
  useGetAdmissionOfferingQuery,
  type AdmissionOfferingListItem,
  useLazyGetAdmissionOfferingsQuery,
} from 'src/redux/student/admissions/admission-offerings-api';
import {
  type DuplicateMatch,
  useCreateAdmissionInquiryMutation,
  useCheckAdmissionInquiryDuplicatesMutation,
  useCreateAdmissionInquiryCommunicationMutation,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { useAdmissionUnsavedChanges } from './use-admission-unsaved-changes';
import { getInquiryCommunicationTemplate } from './inquiry-management/inquiry-communication-templates';
import {
  admissionInquirySchema,
  validateAdmissionInquiry,
  getAdmissionInquiryFields,
  getAdmissionInquirySections,
  buildAdmissionInquiryPayload,
  initialAdmissionInquiryValues,
  canLinkAdmissionInquiryFamily,
  type AdmissionInquiryFormValues,
  getAdmissionInquiryAcademicOptions,
  buildAdmissionInquiryDuplicateInput,
} from './admission-inquiry-model';

const ALL_INQUIRY_SOURCES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function useAdmissionInquiryDialog(onClose: () => void) {
  const [matches, setMatches] = useState<DuplicateMatch[]>([]);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [duplicateOverrideReason, setDuplicateOverrideReason] = useState('');
  const [offeringChoices, setOfferingChoices] = useState<AdmissionOfferingListItem[]>([]);
  const [offeringsLoading, setOfferingsLoading] = useState(true);
  const [offeringsError, setOfferingsError] = useState(false);
  const [offeringsReload, setOfferingsReload] = useState(0);
  const [loadOfferings] = useLazyGetAdmissionOfferingsQuery();
  const [create, createState] = useCreateAdmissionInquiryMutation();
  const [createCommunication, communicationState] =
    useCreateAdmissionInquiryCommunicationMutation();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canAutoAcknowledge =
    hasGrantedPermission(permissions, 'Communication.Campaigns.Add') &&
    hasGrantedPermission(permissions, 'Communication.Campaigns.Send');
  const [checkDuplicates, duplicateState] = useCheckAdmissionInquiryDuplicatesMutation();
  const formik: FormikProps<AdmissionInquiryFormValues> = useFormik<AdmissionInquiryFormValues>({
    initialValues: initialAdmissionInquiryValues,
    validationSchema: admissionInquirySchema,
    validate: (values) =>
      validateAdmissionInquiry(
        values,
        fields,
        policy,
        offeringChoices.find((offering) => offering.id === values.offeringId)
      ),
    onSubmit: async (values) => {
      const offering = offeringChoices.find((item) => item.id === values.offeringId);
      if (!offering) return;
      setRequestError(null);
      try {
        const result = await checkDuplicates(
          buildAdmissionInquiryDuplicateInput(values, fields, offering)
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
  const academicOptions = useMemo(
    () => getAdmissionInquiryAcademicOptions(offeringChoices, formik.values),
    [formik.values, offeringChoices]
  );
  const { data: offeringDetail } = useGetAdmissionOfferingQuery(formik.values.offeringId, {
    skip: !formik.values.offeringId,
    refetchOnMountOrArgChange: true,
  });
  const intakeProfiles = useGetAdmissionIntakeProfilesQuery(undefined, {
    skip: !offeringDetail?.inquiryIntakeProfileId,
  });
  const { data: form, isFetching: formLoading } = useGetAdmissionFormQuery(
    offeringDetail?.inquiryFormDefinitionId ?? '',
    { skip: !offeringDetail?.inquiryFormDefinitionId }
  );
  const { data: workflow, isFetching: workflowLoading } = useGetAdmissionWorkflowQuery(
    offeringDetail?.workflowDefinitionId ?? '',
    { skip: !offeringDetail?.workflowDefinitionId }
  );
  const sections = formik.values.offeringId ? getAdmissionInquirySections(form) : [];
  const fields: AdmissionFormField[] = formik.values.offeringId
    ? getAdmissionInquiryFields(form)
    : [];
  const inquiryStage = workflow?.stages.find((stage) => stage.stageType === 0);
  const profile = intakeProfiles.data?.find((item) => item.id === offeringDetail?.inquiryIntakeProfileId);
  const policy = profile
    ? { ...DEFAULT_INQUIRY_POLICY, ...JSON.parse(profile.configurationJson) }
    : readAdmissionInquiryPolicy(inquiryStage?.configurationJson);
  const allowedSources = policy?.allowedSources.length
    ? policy.allowedSources
    : ALL_INQUIRY_SOURCES;
  const selectedOffering = offeringChoices.find((item) => item.id === formik.values.offeringId);
  const currentGuardianPhone = selectedOffering
    ? buildAdmissionInquiryDuplicateInput(formik.values, fields, selectedOffering).guardianPhone
    : '';

  useAdmissionUnsavedChanges(true, formik.dirty);

  useEffect(() => {
    let active = true;

    const loadOpenOfferings = async () => {
      setOfferingsLoading(true);
      setOfferingsError(false);
      try {
        const items: AdmissionOfferingListItem[] = [];
        const pageSize = 100;
        let totalCount = Number.MAX_SAFE_INTEGER;

        while (active && items.length < totalCount) {
          // Each page starts after the previous result, so these requests must stay sequential.
          // eslint-disable-next-line no-await-in-loop
          const page = await loadOfferings({
            availabilityStatus: 2,
            maxResultCount: pageSize,
            skipCount: items.length,
            sorting: 'BoardName, MediumName, StandardName, Code',
          }).unwrap();
          if (!active) return;
          const { items: pageItems, totalCount: pageTotalCount } = page;
          totalCount = pageTotalCount;
          if (!pageItems.length) break;
          items.push(...pageItems);
        }

        if (active) {
          setOfferingChoices(
            Array.from(new Map(items.filter((offering) => offering.entryMode !== 1)
              .map((offering) => [offering.id, offering])).values())
          );
        }
      } catch {
        if (active) {
          setOfferingChoices([]);
          setOfferingsError(true);
        }
      } finally {
        if (active) setOfferingsLoading(false);
      }
    };

    loadOpenOfferings();
    return () => {
      active = false;
    };
  }, [loadOfferings, offeringsReload]);

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
    const offering = offeringChoices.find((item) => item.id === formik.values.offeringId);
    if (!offering) return;
    setRequestError(null);
    try {
      const inquiry = await create(
        buildAdmissionInquiryPayload(
          formik.values,
          fields,
          offering,
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
    sections,
    fields,
    matches,
    currentGuardianPhone,
    requestError,
    duplicateOverrideReason,
    setDuplicateOverrideReason,
    boards: academicOptions.boards,
    mediums: academicOptions.mediums,
    standards: academicOptions.standards,
    offerings: academicOptions.offerings,
    classCapacity:
      offeringDetail?.id === formik.values.offeringId ? offeringDetail.classCapacity : null,
    offeringsLoading,
    offeringsError,
    retryOfferings: () => setOfferingsReload((current) => current + 1),
    formLoading,
    workflowLoading,
    policy,
    allowedSources,
    canAutoAcknowledge,
    busy: createState.isLoading || duplicateState.isLoading || communicationState.isLoading,
    useExistingFamily: async (familyId: string) => {
      if (
        !matches.some(
          (match) =>
            match.familyId === familyId &&
            canLinkAdmissionInquiryFamily(match, currentGuardianPhone)
        )
      ) {
        setRequestError('Verify the primary guardian mobile before linking this family.');
        return;
      }
      setMatches([]);
      await submit(familyId);
    },
    createSeparateFamily: async () => {
      setMatches([]);
      await submit(null, true);
    },
  };
}
