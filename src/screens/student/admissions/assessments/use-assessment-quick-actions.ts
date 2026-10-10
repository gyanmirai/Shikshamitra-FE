import type { ManagedApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';

import { useFormik } from 'formik';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';

import { assessmentErrorMessage } from './assessment-utils';
import { useAssessmentActions } from './use-assessment-actions';
import { useAssessmentPermissions } from './use-assessment-permissions';
import { latestAssessmentAttempt, validateAssessmentAction } from './assessment-action-model';

import type { AssessmentActionValues } from './assessment-action-model';

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
  const [error, setError] = useState('');
  const canRecordAttendance = permissions.attendance && assessment.canRecordAttendance;
  const canRecordResult = permissions.results && assessment.canRecordResult;
  const formik = useFormik<AssessmentActionValues>({
    initialValues: {
      sessionId: '',
      attendance: 'present',
      outcome: '',
      approved: true,
      marks: '',
      notes: '',
    },
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
        // Use the stamp staff actually reviewed; a refetch must not silently approve a stale draft.
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
  useEffect(() => {
    if (
      formik.dirty &&
      snapshot.current &&
      latestAssessmentAttempt(snapshot.current)?.id !== attempt?.id
    ) {
      setError('The assessment attempt changed. Discard the unsaved result and try again.');
    }
  }, [attempt?.id, formik.dirty]);
  const busy = attendanceBusy || formik.isSubmitting;
  return {
    attempt,
    formik,
    error,
    busy,
    canRecordAttendance,
    canRecordResult,
    changeResult: (field: 'marks' | 'outcome', value: number | string) => {
      if (disabled || busy || !canRecordResult) return;
      if (!formik.dirty) snapshot.current = assessment;
      formik.setFieldValue(field, value);
    },
    discardResult: () => {
      if (busy) return;
      formik.resetForm();
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
