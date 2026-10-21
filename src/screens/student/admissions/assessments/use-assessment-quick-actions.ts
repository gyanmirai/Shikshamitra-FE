import type {
  ApplicationAssessment,
  ManagedApplicationAssessment,
} from 'src/redux/student/admissions/admission-assessment-types';

import { useFormik } from 'formik';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';

import { assessmentErrorMessage } from './assessment-utils';
import { useAssessmentActions } from './use-assessment-actions';
import { useAssessmentPermissions } from './use-assessment-permissions';
import { latestAssessmentAttempt, validateAssessmentAction } from './assessment-action-model';
import { assessmentResultProfile, assessmentSubjectValues } from './assessment-subject-results';

import type { AssessmentActionValues } from './assessment-action-model';

function initialValues(assessment: ApplicationAssessment): AssessmentActionValues {
  const attempt = latestAssessmentAttempt(assessment);
  return {
    sessionId: '',
    attendance: 'present',
    outcome: '',
    approved: true,
    marks: '',
    notes: attempt?.effectiveProfile ? (attempt.notes ?? '') : '',
    subjectScores: assessmentSubjectValues(attempt),
  };
}

export function useAssessmentQuickActions(
  assessment: ManagedApplicationAssessment,
  disabled: boolean
) {
  const permissions = useAssessmentPermissions();
  const run = useAssessmentActions(assessment);
  const attempt = latestAssessmentAttempt(assessment);
  const snapshot = useRef<ManagedApplicationAssessment | null>(null);
  const submitting = useRef(false);
  const [attendanceBusy, setAttendanceBusy] = useState(false);
  const [draftBusy, setDraftBusy] = useState(false);
  const [draftValidation, setDraftValidation] = useState(false);
  const [error, setError] = useState('');
  const canRecordAttendance = permissions.attendance && assessment.canRecordAttendance;
  const canRecordResult = permissions.results && assessment.canRecordResult;
  const canSaveDraft = permissions.results && Boolean(assessment.canSaveResultDraft);
  const loadedStamp = useRef(attempt?.concurrencyStamp);
  const formik = useFormik<AssessmentActionValues>({
    initialValues: initialValues(assessment),
    validate: (values) =>
      validateAssessmentAction('result', values, snapshot.current ?? assessment),
    onSubmit: async (values) => {
      if (disabled || submitting.current || !canRecordResult || !attempt) return;
      if (snapshot.current && latestAssessmentAttempt(snapshot.current)?.id !== attempt.id) {
        setError('The assessment attempt changed. Discard the unsaved result and try again.');
        return;
      }
      submitting.current = true;
      setError('');
      try {
        // Keep the stamp staff reviewed; a refetch must not silently accept a stale result.
        await run('result', values, snapshot.current ?? assessment);
        formik.resetForm();
        snapshot.current = null;
        shikshaMitraToast.success({ message: 'Assessment result saved' });
      } catch (failure) {
        setError(assessmentErrorMessage(failure));
      } finally {
        submitting.current = false;
      }
    },
  });
  const { dirty, resetForm } = formik;
  useEffect(() => {
    if (!dirty && !submitting.current && loadedStamp.current !== attempt?.concurrencyStamp) {
      resetForm({ values: initialValues(assessment) });
      loadedStamp.current = attempt?.concurrencyStamp;
      snapshot.current = null;
    }
    if (
      dirty &&
      snapshot.current &&
      latestAssessmentAttempt(snapshot.current)?.id !== attempt?.id
    ) {
      setError('The assessment attempt changed. Discard the unsaved result and try again.');
    }
  }, [assessment, attempt?.concurrencyStamp, attempt?.id, dirty, resetForm]);
  const busy = attendanceBusy || draftBusy || formik.isSubmitting;
  return {
    attempt,
    formik,
    error,
    busy,
    canRecordAttendance,
    canRecordResult,
    canSaveDraft,
    draftValidation,
    prepareSubmit: () => setDraftValidation(false),
    profile: assessmentResultProfile(assessment, attempt),
    changeResult: (field: 'marks' | 'outcome', value: number | string) => {
      if (disabled || busy || !canRecordResult) return;
      if (!formik.dirty) snapshot.current = assessment;
      formik.setFieldValue(field, value);
    },
    changeSubject: (code: string, value: string) => {
      if (disabled || busy || !canRecordResult) return;
      if (!formik.dirty) snapshot.current = assessment;
      formik.setFieldValue('subjectScores', { ...formik.values.subjectScores, [code]: value });
    },
    saveDraft: async () => {
      if (disabled || busy || submitting.current || !canSaveDraft || !attempt) return;
      if (snapshot.current && latestAssessmentAttempt(snapshot.current)?.id !== attempt.id) {
        setError('The assessment attempt changed. Discard the unsaved result and try again.');
        return;
      }
      setDraftValidation(true);
      const errors = validateAssessmentAction(
        'resultDraft',
        formik.values,
        snapshot.current ?? assessment
      );
      formik.setErrors(errors);
      if (Object.keys(errors).length) return;
      submitting.current = true;
      setDraftBusy(true);
      setError('');
      try {
        const updated = await run('resultDraft', formik.values, snapshot.current ?? assessment);
        formik.resetForm({ values: initialValues(updated) });
        snapshot.current = null;
        shikshaMitraToast.success({ message: 'Assessment draft saved' });
      } catch (failure) {
        setError(assessmentErrorMessage(failure));
      } finally {
        submitting.current = false;
        setDraftBusy(false);
      }
    },
    discardResult: () => {
      if (busy) return;
      formik.resetForm({ values: initialValues(assessment) });
      loadedStamp.current = attempt?.concurrencyStamp;
      snapshot.current = null;
      setError('');
    },
    recordAttendance: async (attendance: 'present' | 'absent') => {
      if (
        disabled ||
        submitting.current ||
        busy ||
        formik.dirty ||
        !canRecordAttendance ||
        !attempt
      )
        return;
      submitting.current = true;
      setAttendanceBusy(true);
      setError('');
      try {
        await run('attendance', { ...formik.values, attendance }, assessment);
        shikshaMitraToast.success({ message: 'Assessment attendance saved' });
      } catch (failure) {
        setError(assessmentErrorMessage(failure));
      } finally {
        submitting.current = false;
        setAttendanceBusy(false);
      }
    },
  };
}
