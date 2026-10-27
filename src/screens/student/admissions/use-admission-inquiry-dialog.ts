'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionFormField } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';
import type { AdmissionSiblingParentSelection } from 'src/redux/student/admissions/admission-parent-family-types';

import { useSelector } from 'react-redux';
import { useFormik, type FormikProps } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useMemo, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  DEFAULT_INQUIRY_POLICY,
  withStandardInquiryBehavior,
} from 'src/redux/student/admissions/admission-inquiry-policy';
import {
  type DuplicateMatch,
  useCreateAdmissionInquiryMutation,
  useGetAdmissionInquiryCaptureContextQuery,
  useCheckAdmissionInquiryDuplicatesMutation,
  useGetAdmissionInquiryCaptureCatalogueQuery,
  useCreateAdmissionInquiryCommunicationMutation,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { useAdmissionPhotoReads } from './use-admission-photo-reads';
import { useAdmissionUnsavedChanges } from './use-admission-unsaved-changes';
import { getAdmissionSiblingParentReviewError } from './admission-family-contacts-model';
import { getInquiryCommunicationTemplate } from './inquiry-management/inquiry-communication-templates';
import {
  admissionInquirySchema,
  validateAdmissionInquiry,
  getAdmissionInquirySections,
  buildAdmissionInquiryPayload,
  initialAdmissionInquiryValues,
  canLinkAdmissionInquiryFamily,
  type AdmissionInquiryFormValues,
  preserveCompatibleInquiryAnswers,
  getAdmissionInquiryAcademicOptions,
  buildAdmissionInquiryDuplicateInput,
} from './admission-inquiry-model';

const EMPTY_OFFERINGS: AdmissionOfferingListItem[] = [];
const ALL_INQUIRY_SOURCES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function useAdmissionInquiryDialog(onClose: () => void) {
  const { readingPhoto, onPhotoReading } = useAdmissionPhotoReads();
  const previousForm = useRef<{
    fields: AdmissionFormField[];
    values: Record<string, string>;
  } | null>(null);
  const [matches, setMatches] = useState<DuplicateMatch[]>([]);
  const [matchesKey, setMatchesKey] = useState('');
  const identityKeyRef = useRef('');
  const [requestError, setRequestError] = useState<string | null>(null);
  const [duplicateOverrideReason, setDuplicateOverrideReason] = useState('');
  const academicYearId = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const catalogue = useGetAdmissionInquiryCaptureCatalogueQuery(
    { academicYearId },
    { refetchOnMountOrArgChange: true }
  );
  const offeringChoices = catalogue.currentData?.offerings ?? EMPTY_OFFERINGS;
  const offeringsLoading = catalogue.isFetching;
  const offeringsError = catalogue.isError;
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
      if (!offering || !canCreateInquiry || readingPhoto || runtimeLoading || runtimeError) return;
      setRequestError(null);
      const key = JSON.stringify([
        offering.id,
        buildAdmissionInquiryDuplicateInput(values, fields, offering),
      ]);
      try {
        const result = await checkDuplicates(
          buildAdmissionInquiryDuplicateInput(values, fields, offering)
        ).unwrap();
        if (identityKeyRef.current !== key) return;
        setMatches(result);
        setMatchesKey(key);
        if (!result.length) await submit();
      } catch (error) {
        const message = parseApiProblemDetail(error).detail || 'Duplicate check failed';
        shikshaMitraToast.error({ message });
      }
    },
  });
  const academicOptions = useMemo(
    () => getAdmissionInquiryAcademicOptions(offeringChoices, formik.values),
    [formik.values, offeringChoices]
  );
  const runtime = useGetAdmissionInquiryCaptureContextQuery(formik.values.offeringId, {
    skip: !formik.values.offeringId,
    refetchOnMountOrArgChange: true,
  });
  const offeringDetail = runtime.currentData?.offering;
  const form = runtime.currentData?.form ?? undefined;
  const runtimeError = runtime.isError;
  const runtimeLoading =
    Boolean(formik.values.offeringId) &&
    !runtimeError &&
    (runtime.isFetching || !runtime.currentData);
  const canCreateInquiry = Boolean(runtime.currentData?.availability.canCreateInquiry);
  const sections =
    formik.values.offeringId && !runtimeLoading && !runtimeError && canCreateInquiry
      ? getAdmissionInquirySections(form)
      : [];
  const fields: AdmissionFormField[] = sections.flatMap((section) => section.fields);
  const policy = withStandardInquiryBehavior(runtime.currentData?.policy ?? DEFAULT_INQUIRY_POLICY);
  const workflowLoading = false;
  const allowedSources = policy?.allowedSources.length
    ? policy.allowedSources
    : ALL_INQUIRY_SOURCES;
  const selectedOffering = offeringChoices.find((item) => item.id === formik.values.offeringId);
  const currentGuardianPhone = selectedOffering
    ? buildAdmissionInquiryDuplicateInput(formik.values, fields, selectedOffering).guardianPhone
    : '';
  const currentGuardianEmail = selectedOffering
    ? (buildAdmissionInquiryDuplicateInput(formik.values, fields, selectedOffering).guardianEmail ??
      '')
    : '';
  const identityKey = selectedOffering
    ? JSON.stringify([
        selectedOffering.id,
        buildAdmissionInquiryDuplicateInput(formik.values, fields, selectedOffering),
      ])
    : '';
  identityKeyRef.current = identityKey;
  const currentMatches = matchesKey === identityKey ? matches : [];

  useEffect(() => {
    if (
      !canCreateInquiry ||
      readingPhoto ||
      runtimeLoading ||
      runtimeError ||
      offeringDetail?.id !== formik.values.offeringId
    )
      return;
    let next = formik.values.fields;
    if (!Object.keys(next).length) {
      next = preserveCompatibleInquiryAnswers(
        previousForm.current?.fields ?? [],
        fields,
        previousForm.current?.values ?? {}
      );
      if (Object.keys(next).length) formik.setFieldValue('fields', next, false);
    }
    previousForm.current = { fields, values: next };
  }, [
    canCreateInquiry,
    fields,
    formik,
    offeringDetail,
    readingPhoto,
    runtimeError,
    runtimeLoading,
  ]);

  useAdmissionUnsavedChanges(true, formik.dirty);

  useEffect(() => {
    const candidates = academicOptions.offerings.filter(
      (item) =>
        item.availabilityStatus === 2 && item.configurationStatus === 1 && item.entryMode !== 1
    );
    if (
      formik.values.admissionCycleId &&
      formik.values.standardId &&
      candidates.length === 1 &&
      !formik.values.offeringId
    ) {
      formik.setFieldValue('offeringId', candidates[0].id, false);
    }
  }, [academicOptions.offerings, formik]);

  useEffect(() => {
    if (
      !workflowLoading &&
      allowedSources.length &&
      !allowedSources.includes(formik.values.source)
    ) {
      formik.setFieldValue('source', allowedSources[0], false);
    }
  }, [allowedSources, formik, workflowLoading]);

  async function submit(
    existingFamilyId?: string | null,
    createSeparateFamily = false,
    parentSelection?: AdmissionSiblingParentSelection
  ) {
    const offering = offeringChoices.find((item) => item.id === formik.values.offeringId);
    if (!offering || !canCreateInquiry || readingPhoto || runtimeLoading || runtimeError) return;
    const errors = await formik.validateForm();
    if (Object.keys(errors).length) return;
    setRequestError(null);
    try {
      const inquiry = await create(
        buildAdmissionInquiryPayload(
          formik.values,
          fields,
          offering,
          existingFamilyId,
          createSeparateFamily,
          duplicateOverrideReason,
          parentSelection
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
      shikshaMitraToast.error({ message });
    }
  }

  return {
    formik,
    ageContext: !runtimeLoading && !runtimeError ? runtime.currentData : undefined,
    form,
    sections,
    fields,
    matches: currentMatches,
    currentGuardianPhone,
    currentGuardianEmail,
    requestError,
    duplicateOverrideReason,
    setDuplicateOverrideReason,
    periods: catalogue.currentData?.periods ?? [],
    boards: Array.from(
      new Map(
        (catalogue.currentData?.academicOptions ?? []).map((item) => [
          item.boardId,
          { id: item.boardId, name: item.boardName },
        ])
      ).values()
    ),
    mediums: Array.from(
      new Map(
        (catalogue.currentData?.academicOptions ?? [])
          .filter((item) => item.boardId === formik.values.boardId)
          .map((item) => [item.mediumId, { id: item.mediumId, name: item.mediumName }])
      ).values()
    ),
    standards: Array.from(
      new Map(
        (catalogue.currentData?.academicOptions ?? [])
          .filter(
            (item) =>
              item.boardId === formik.values.boardId && item.mediumId === formik.values.mediumId
          )
          .map((item) => [item.standardId, { id: item.standardId, name: item.standardName }])
      ).values()
    ),
    offerings: academicOptions.offerings.filter(
      (item) =>
        item.availabilityStatus === 2 && item.configurationStatus === 1 && item.entryMode !== 1
    ),
    canCreateInquiry,
    unavailableReason: runtime.currentData?.availability.reasonMessage,
    academicLoading: catalogue.isFetching,
    academicError: catalogue.isError,
    retryAcademic: () => catalogue.refetch(),
    selectedOffering,
    classCapacity:
      offeringDetail?.id === formik.values.offeringId ? offeringDetail.classCapacity : null,
    offeringsLoading,
    offeringsError,
    retryOfferings: () => catalogue.refetch(),
    formLoading: runtime.isFetching,
    workflowLoading,
    runtimeLoading,
    runtimeError,
    retryRuntime: () => runtime.refetch(),
    policy,
    allowedSources,
    canAutoAcknowledge,
    onPhotoReading,
    busy:
      readingPhoto ||
      createState.isLoading ||
      duplicateState.isLoading ||
      communicationState.isLoading,
    useExistingFamily: async (familyId: string, parent: AdmissionSiblingParentSelection) => {
      if (
        !currentMatches.some(
          (match) =>
            match.familyId === familyId &&
            canLinkAdmissionInquiryFamily(match, currentGuardianPhone, currentGuardianEmail) &&
            match.parents?.some(
              (candidate) =>
                candidate.sourceApplicantId === parent.sourceApplicantId &&
                (!candidate.relationship || candidate.relationship === parent.relationship)
            )
        )
      ) {
        setRequestError('Check the parent details again before linking this family.');
        return;
      }
      const parentReviewError = getAdmissionSiblingParentReviewError(
        formik.values.familyContacts,
        formik.values.parentRelationship,
        parent.relationship
      );
      if (parentReviewError) {
        setRequestError(parentReviewError);
        return;
      }
      await submit(familyId, false, parent);
    },
    createSeparateFamily: async () => {
      if (!currentMatches.length || !duplicateOverrideReason.trim()) return;
      await submit(null, true);
    },
  };
}
