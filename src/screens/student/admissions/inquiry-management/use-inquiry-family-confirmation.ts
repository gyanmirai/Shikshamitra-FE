import type {
  AdmissionInquiry,
  AdmissionInquiryDuplicateInput,
} from 'src/redux/student/admissions/admission-inquiries-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useLazyGetAdmissionInquiryQuery,
  useConfirmAdmissionInquiryFamilyMutation,
  useCheckAdmissionInquiryDuplicatesMutation,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { buildInquiryFamilyReviews } from '../admission-inquiry-parent-review-model';
import {
  inquiryFamilyCandidates,
  inquiryFamilyConfirmationReason,
} from './inquiry-family-confirmation-model';

export type InquiryFamilyConfirmationProps = {
  inquiry: AdmissionInquiry;
  readOnly: boolean;
  dirty: boolean;
  busy: boolean;
  duplicateInput?: AdmissionInquiryDuplicateInput;
  onConfirmed: (inquiry: AdmissionInquiry) => void;
  onBusyChange: (busy: boolean) => void;
  onTargetRefreshed?: (inquiry: AdmissionInquiry) => AdmissionInquiryDuplicateInput | null;
};

export function useInquiryFamilyConfirmation(props: InquiryFamilyConfirmationProps) {
  const latest = useRef(props);
  latest.current = props;
  const [checkDuplicates] = useCheckAdmissionInquiryDuplicatesMutation();
  const [confirm] = useConfirmAdmissionInquiryFamilyMutation();
  const [refreshTarget] = useLazyGetAdmissionInquiryQuery();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const savingRef = useRef(false);
  const generation = useRef(0);
  const mounted = useRef(true);
  const [snapshot, setSnapshot] = useState<{ id: string; stamp: string } | null>(null);
  const [candidates, setCandidates] = useState<ReturnType<typeof inquiryFamilyCandidates>>([]);
  const [reviewInput, setReviewInput] = useState(props.duplicateInput);
  const [requestError, setRequestError] = useState('');
  const [needsTargetRefresh, setNeedsTargetRefresh] = useState(false);
  const [refreshedTarget, setRefreshedTarget] = useState<{
    inquiry: AdmissionInquiry;
    previousStamp: string;
  } | null>(null);
  const refreshedTargetRef = useRef(refreshedTarget);
  const loadingRef = useRef(false);
  const effectiveTarget = (inquiry: AdmissionInquiry) => {
    const refreshed = refreshedTargetRef.current;
    return refreshed?.inquiry.id === inquiry.id &&
      refreshed.previousStamp === inquiry.concurrencyStamp
      ? refreshed.inquiry
      : inquiry;
  };
  const target = effectiveTarget(props.inquiry);
  const entryReason =
    inquiryFamilyConfirmationReason(target, props.readOnly, props.dirty, props.busy) ||
    (!props.duplicateInput ? 'Wait for the saved inquiry details to load.' : null);
  const staleTarget = Boolean(
    snapshot && (snapshot.id !== target.id || snapshot.stamp !== target.concurrencyStamp)
  );
  const formik = useFormik({
    initialValues: { family: '' },
    validationSchema: Yup.object({
      family: Yup.string()
        .oneOf(
          candidates.map((match) => match.familyId),
          'Select an available family.'
        )
        .required('Select a family.'),
    }),
    onSubmit: async (values) => {
      const { current } = latest;
      const currentTarget = effectiveTarget(current.inquiry);
      if (
        savingRef.current ||
        discardOpen ||
        loading ||
        needsTargetRefresh ||
        !snapshot ||
        snapshot.id !== currentTarget.id ||
        snapshot.stamp !== currentTarget.concurrencyStamp ||
        inquiryFamilyConfirmationReason(
          currentTarget,
          current.readOnly,
          current.dirty,
          current.busy
        )
      )
        return;
      const source = candidates.find((candidate) => candidate.familyId === values.family);
      if (!source?.applicantId) return;
      const activeGeneration = generation.current;
      savingRef.current = true;
      setSaving(true);
      setRequestError('');
      try {
        const result = await confirm({
          id: current.inquiry.id,
          body: {
            existingFamilyId: source.familyId,
            existingParentApplicantId: source.applicantId,
            familyLinkOnly: true,
            concurrencyStamp: snapshot.stamp,
          },
        }).unwrap();
        if (
          !mounted.current ||
          activeGeneration !== generation.current ||
          latest.current.inquiry.id !== current.inquiry.id ||
          latest.current.dirty
        )
          return;
        current.onConfirmed(result);
        setOpen(false);
        formik.resetForm();
        current.onBusyChange(false);
        shikshaMitraToast.success({ message: 'Sibling family confirmed.' });
      } catch (error) {
        if (mounted.current && activeGeneration === generation.current) {
          setNeedsTargetRefresh(true);
          setRequestError(
            parseApiProblemDetail(error).detail ||
              'Unable to confirm this family. Your selection is preserved; reload matches and try again.'
          );
        }
      } finally {
        savingRef.current = false;
        if (mounted.current) setSaving(false);
      }
    },
  });
  const load = async (reloadTarget = false) => {
    const { current } = latest;
    if (savingRef.current || loadingRef.current || entryReason || !current.duplicateInput) return;
    loadingRef.current = true;
    generation.current += 1;
    const activeGeneration = generation.current;
    setOpen(true);
    current.onBusyChange(true);
    setLoading(true);
    setRequestError('');
    try {
      let lookupTarget = effectiveTarget(current.inquiry);
      let { duplicateInput } = current;
      if (reloadTarget || needsTargetRefresh) {
        setNeedsTargetRefresh(true);
        const refreshed = await refreshTarget(current.inquiry.id, false).unwrap();
        if (
          !mounted.current ||
          activeGeneration !== generation.current ||
          latest.current.inquiry.id !== current.inquiry.id
        )
          return;
        const guard = inquiryFamilyConfirmationReason(
          refreshed,
          latest.current.readOnly,
          latest.current.dirty,
          latest.current.busy
        );
        if (refreshed.id !== current.inquiry.id)
          throw new Error('The refreshed inquiry did not match this record. Close and reopen it.');
        if (latest.current.dirty || latest.current.busy || latest.current.readOnly)
          throw new Error(
            guard || 'The inquiry draft changed. Save or discard it before reloading.'
          );
        const refreshedInput = latest.current.onTargetRefreshed?.(refreshed);
        if (refreshedInput === null)
          throw new Error('The inquiry draft changed. Save or discard it before reloading.');
        const accepted = { inquiry: refreshed, previousStamp: current.inquiry.concurrencyStamp };
        refreshedTargetRef.current = accepted;
        setRefreshedTarget(accepted);
        lookupTarget = refreshed;
        if (guard) throw new Error(guard);
        duplicateInput = refreshedInput ?? {
          admissionCycleId: refreshed.admissionCycleId,
          guardianPhone: refreshed.normalizedPhone,
          guardianEmail: refreshed.email ?? undefined,
          applicantName: refreshed.applicantName,
          applicantDateOfBirth: refreshed.applicantDateOfBirth ?? undefined,
        };
      }
      const matches = await checkDuplicates(duplicateInput).unwrap();
      if (
        mounted.current &&
        activeGeneration === generation.current &&
        latest.current.inquiry.id === current.inquiry.id
      ) {
        setSnapshot({ id: lookupTarget.id, stamp: lookupTarget.concurrencyStamp });
        const nextCandidates = inquiryFamilyCandidates(lookupTarget, matches);
        setCandidates(nextCandidates);
        setReviewInput(duplicateInput);
        const families = buildInquiryFamilyReviews(nextCandidates);
        const onlyFamily = families.length === 1 ? families[0] : undefined;
        formik.resetForm({
          values: {
            family: onlyFamily?.familyId ?? '',
          },
        });
        setNeedsTargetRefresh(false);
      }
    } catch (error) {
      if (mounted.current && activeGeneration === generation.current)
        setRequestError(
          parseApiProblemDetail(error).detail || 'Family matches could not be loaded. Try again.'
        );
    } finally {
      if (mounted.current && activeGeneration === generation.current) {
        setLoading(false);
        loadingRef.current = false;
      }
    }
  };
  const close = () => {
    if (savingRef.current || saving || formik.isSubmitting) return;
    generation.current += 1;
    setOpen(false);
    setDiscardOpen(false);
    setLoading(false);
    loadingRef.current = false;
    formik.resetForm();
    props.onBusyChange(false);
  };
  const requestClose = () => {
    if (savingRef.current || saving || formik.isSubmitting) return;
    if (formik.dirty) setDiscardOpen(true);
    else close();
  };
  useEffect(() => {
    if (!open || !formik.dirty) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [open, formik.dirty]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current += 1;
      latest.current.onBusyChange(false);
    };
  }, []);
  const families = buildInquiryFamilyReviews(candidates);
  const selectedFamily = families.find((family) => family.familyId === formik.values.family);
  return {
    open,
    load,
    reload: () => load(true),
    close,
    requestClose,
    discardOpen,
    keepEditing: () => {
      if (!savingRef.current) setDiscardOpen(false);
    },
    candidates,
    reviewInput,
    loading,
    saving: saving || formik.isSubmitting,
    entryReason,
    staleTarget,
    needsTargetRefresh,
    requestError,
    formik,
    families,
    selectedFamily,
  };
}
