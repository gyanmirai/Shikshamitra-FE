'use client';

import type { StudentOnboardingCase } from 'src/redux/student/onboarding/student-onboarding-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useMemo, useState, useEffect } from 'react';
import {
  useGetStudentOnboardingCaseQuery,
  useGetStudentOnboardingSettingsQuery,
  useAssignStudentOnboardingGrMutation,
  useLazyGetStudentOnboardingCaseQuery,
  useAssignStudentOnboardingRollMutation,
  usePreviewStudentOnboardingRollMutation,
  useSetStudentOnboardingPlacementMutation,
  useGetAvailableStudentIdentifierSeriesQuery,
  useGetStudentOnboardingPlacementOptionsQuery,
  useLazyGetAvailableStudentIdentifierSeriesQuery,
} from 'src/redux/student/onboarding/student-onboarding-api';

import { getOnboardingErrorMessage } from './student-onboarding-messages';
import { useStudentRollAutoPreview } from './use-student-roll-auto-preview';
import {
  readQuickGrMode,
  saveQuickAcademic,
  quickAcademicSeries,
  quickAcademicInitialValues,
} from './student-quick-setup-academic-model';

import type { QuickAcademicValues } from './student-quick-setup-academic-model';

const emptyValues: QuickAcademicValues = {
  divisionId: '',
  divisionReason: '',
  numberSeriesId: '',
  grMode: '',
  grValue: '',
  grReason: '',
  rollMode: '',
  rollValue: '',
  rollReason: '',
};

export function useStudentQuickSetupAcademic({
  caseId,
  canManage,
  disabled = false,
  reportSaveErrors = true,
}: {
  caseId: string;
  canManage: boolean;
  disabled?: boolean;
  /** The page coordinator owns feedback when saving several setup sections together. */
  reportSaveErrors?: boolean;
}) {
  const caseQuery = useGetStudentOnboardingCaseQuery(caseId, { skip: !caseId });
  const remoteCase = caseQuery.currentData;
  const readError = Boolean(caseQuery.isError);
  const permissionDenied = Boolean(
    readError &&
    caseQuery.error &&
    'status' in caseQuery.error &&
    (caseQuery.error.status === 401 || caseQuery.error.status === 403)
  );
  const baselineRef = useRef<StudentOnboardingCase | null>(null);
  const busyRef = useRef(false);
  const saveRef = useRef<() => Promise<StudentOnboardingCase>>(undefined);
  const [savedCase, setSavedCase] = useState<StudentOnboardingCase>();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string>();
  const [failureIsLocal, setFailureIsLocal] = useState(false);
  const [editingGr, setEditingGr] = useState(false);
  const [editingRoll, setEditingRoll] = useState(false);
  const item = savedCase?.id === caseId ? savedCase : remoteCase;
  const closed = Boolean(item?.studentEnrollmentId || (item && [4, 5, 6].includes(item.status)));
  const placements = useGetStudentOnboardingPlacementOptionsQuery(caseId, {
    skip: !caseId || !canManage || closed || readError,
  });
  const seriesQuery = useGetAvailableStudentIdentifierSeriesQuery(caseId, {
    skip: !caseId || !canManage || closed || readError,
  });
  const settingsQuery = useGetStudentOnboardingSettingsQuery(
    { academicYearId: item?.academicYearId },
    { skip: !item?.academicYearId || !canManage || closed || readError }
  );
  const grPolicy = item
    ? readQuickGrMode(settingsQuery.currentData, item.academicYearId)
    : undefined;
  const [getCase] = useLazyGetStudentOnboardingCaseQuery();
  const [getSeries] = useLazyGetAvailableStudentIdentifierSeriesQuery();
  const [setPlacement] = useSetStudentOnboardingPlacementMutation();
  const [assignGr] = useAssignStudentOnboardingGrMutation();
  const [previewRoll] = usePreviewStudentOnboardingRollMutation();
  const [assignRoll] = useAssignStudentOnboardingRollMutation();
  const services = useMemo(
    () => ({
      getCase: (id: string) => getCase(id, false).unwrap(),
      getSeries: (id: string) => getSeries(id, false).unwrap(),
      setPlacement: (input: Parameters<typeof setPlacement>[0]) => setPlacement(input).unwrap(),
      assignGr: (input: Parameters<typeof assignGr>[0]) => assignGr(input).unwrap(),
      previewRoll: (input: Parameters<typeof previewRoll>[0]) => previewRoll(input).unwrap(),
      assignRoll: (input: Parameters<typeof assignRoll>[0]) => assignRoll(input).unwrap(),
    }),
    [getCase, getSeries, setPlacement, assignGr, previewRoll, assignRoll]
  );

  const form = useFormik<QuickAcademicValues>({
    initialValues: emptyValues,
    validationSchema: Yup.object({
      divisionId: Yup.string(),
      divisionReason: Yup.string().max(1000, 'Reason must be 1000 characters or fewer.'),
      numberSeriesId: Yup.string(),
      grMode: Yup.string().oneOf(['', 'manual', 'automatic']),
      grValue: Yup.string()
        .trim()
        .max(100, 'GR number must be 100 characters or fewer.')
        .test('cannot-clear-gr', 'Enter a GR number.', (value) => !editingGr || Boolean(value)),
      grReason: Yup.string()
        .max(1000, 'Reason must be 1000 characters or fewer.')
        .when('grValue', {
          is: (value: string) =>
            Boolean(editingGr && item?.grNumber && value.trim() !== item.grNumber),
          then: (field) => field.trim().required('Explain why this number needs to change.'),
        }),
      rollMode: Yup.string().oneOf(['', 'manual', 'automatic']),
      rollValue: Yup.string()
        .test(
          'cannot-clear-roll',
          'Enter a roll number.',
          (value) => !editingRoll || Boolean(value)
        )
        .when('rollMode', {
          is: 'manual',
          then: (field) =>
            field.test(
              'positive-roll',
              'Enter a positive whole roll number.',
              (value) =>
                !value || (/^\d+$/.test(value) && Number(value) > 0 && Number(value) <= 2147483647)
            ),
        }),
      rollReason: Yup.string()
        .max(1000, 'Reason must be 1000 characters or fewer.')
        .when('rollValue', {
          is: (value: string) =>
            Boolean(
              editingRoll &&
              item?.rollNumber &&
              item.rollChangeReasonRequired &&
              Number(value) !== item.rollNumber
            ),
          then: (field) => field.trim().required('Explain why this number needs to change.'),
        }),
    }),
    onSubmit: async () => {
      await saveRef.current?.();
    },
  });
  const { resetForm } = form;
  const targetDivision = form.values.divisionId;
  const rollPlacementChanged = Boolean(
    item?.divisionId && targetDivision !== item.divisionId && !item.rollNumberLocked
  );
  const rollPreview = useStudentRollAutoPreview({
    caseId: item?.id === caseId ? caseId : '',
    divisionId: targetDivision,
    concurrencyStamp: item?.concurrencyStamp,
    reason: form.values.rollReason,
    preview: services.previewRoll,
    enabled: Boolean(
      canManage &&
      !disabled &&
      !busy &&
      !closed &&
      !readError &&
      item &&
      form.values.rollMode === 'automatic' &&
      (!item.rollNumber || rollPlacementChanged) &&
      (item.rollAssignmentMode === 'automatic' ||
        item.rollAssignmentMode === 'both' ||
        (item.rollNumberLocked && !item.rollNumber)) &&
      !placements.isError &&
      (targetDivision === item.divisionId ||
        placements.data?.some((division) => division.id === targetDivision && !division.isFull))
    ),
  });
  // Background cache invalidation must not overwrite an unsaved field or its baseline.
  useEffect(() => {
    if (baselineRef.current?.id !== caseId) {
      baselineRef.current = null;
      setSavedCase(undefined);
      setEditingGr(false);
      setEditingRoll(false);
      setFailure(undefined);
      resetForm({ values: emptyValues });
    }
  }, [caseId, resetForm]);
  useEffect(() => {
    if (remoteCase && !busyRef.current) setSavedCase(remoteCase);
  }, [remoteCase]);
  useEffect(() => {
    if (!remoteCase || settingsQuery.isLoading) return;
    if (baselineRef.current) {
      // A failed first settings request may be retried without closing the drawer.
      // Adopt a newly available policy only while the user has not edited anything.
      if (!form.dirty && !form.values.grMode && grPolicy) {
        resetForm({ values: quickAcademicInitialValues(remoteCase, grPolicy) });
      }
      return;
    }
    baselineRef.current = remoteCase;
    resetForm({ values: quickAcademicInitialValues(remoteCase, grPolicy) });
  }, [remoteCase, grPolicy, resetForm, settingsQuery.isLoading, form.dirty, form.values.grMode]);

  const save = async (): Promise<StudentOnboardingCase> => {
    if (busyRef.current || disabled) throw new Error('Wait for the current action to finish.');
    if (!canManage) throw new Error('You do not have permission to update student setup.');
    if (readError) throw new Error('Student setup could not be loaded. Retry before saving.');
    if (!baselineRef.current) throw new Error('Wait for student setup to load.');
    const errors = await form.validateForm();
    if (Object.keys(errors).length) {
      await form.setTouched(Object.fromEntries(Object.keys(errors).map((name) => [name, true])));
      document.querySelector<HTMLElement>(`[name="${Object.keys(errors)[0]}"]`)?.focus();
      throw new Error('Review the highlighted fields.');
    }
    // Validation yields; a second click may have reached this point in the meantime.
    if (busyRef.current) throw new Error('Wait for the current action to finish.');
    busyRef.current = true;
    setBusy(true);
    setFailure(undefined);
    try {
      const saved = await saveQuickAcademic({
        baseline: baselineRef.current,
        values: form.values,
        grPolicy,
        services,
        onSaved: (field, current) => {
          const baseline = baselineRef.current!;
          baselineRef.current = {
            ...baseline,
            concurrencyStamp: current.concurrencyStamp,
            ...(field === 'division'
              ? {
                  divisionId: current.divisionId,
                  divisionName: current.divisionName,
                  rollNumber: current.rollNumber,
                }
              : {}),
            ...(field === 'gr' ? { grNumber: current.grNumber } : {}),
            ...(field === 'roll' ? { rollNumber: current.rollNumber } : {}),
          };
          setSavedCase(current);
          if (field === 'gr') setEditingGr(false);
          if (field === 'roll') setEditingRoll(false);
        },
      });
      baselineRef.current = saved;
      setSavedCase(saved);
      setEditingGr(false);
      setEditingRoll(false);
      resetForm({ values: quickAcademicInitialValues(saved, grPolicy) });
      return saved;
    } catch (error) {
      if (error instanceof Yup.ValidationError && error.path) {
        await form.setFieldTouched(error.path, true, false);
        form.setFieldError(error.path, error.message);
      }
      if (reportSaveErrors) {
        setFailureIsLocal(error instanceof Error && !('data' in error) && !('status' in error));
        setFailure(getOnboardingErrorMessage(error, 'Could not save student setup. Try again.'));
      }
      throw error;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  saveRef.current = save;

  return {
    caseData: item,
    form,
    busy,
    dirty: form.dirty,
    readError,
    permissionDenied,
    loading: caseQuery.isLoading || (!baselineRef.current && settingsQuery.isLoading),
    error: readError ? 'Student setup could not be loaded.' : failure,
    errorPresentation: readError || !failureIsLocal ? ('toast' as const) : ('inline' as const),
    retry: () => {
      setFailure(undefined);
      caseQuery.refetch();
      if (canManage && !closed && !readError) {
        placements.refetch();
        seriesQuery.refetch();
        if (item?.academicYearId) settingsQuery.refetch();
      }
    },
    save,
    disabled: disabled || busy || !canManage || closed || readError,
    closed,
    grPolicy,
    placements,
    seriesQuery,
    settingsQuery,
    series: item ? quickAcademicSeries(seriesQuery.data ?? [], item) : [],
    editingGr,
    editingRoll,
    rollPreview,
    changeRollMode: (mode: QuickAcademicValues['rollMode']) => {
      form.setFieldValue('rollMode', mode);
      if (mode === 'automatic' && form.values.rollMode === 'automatic') rollPreview.refresh();
    },
    changeDivision: (divisionId: string) => {
      form.setFieldValue('divisionId', divisionId);
      if (item?.rollNumber && !item.rollNumberLocked && !editingRoll) {
        const policy = item.rollAssignmentMode;
        form.setFieldValue(
          'rollMode',
          divisionId === item.divisionId
            ? 'manual'
            : policy === 'manual'
              ? 'manual'
              : policy
                ? 'automatic'
                : ''
        );
      }
    },
    changeGr: () => {
      setEditingGr(true);
      form.setFieldValue('grMode', 'manual');
    },
    changeRoll: () => {
      setEditingRoll(true);
      form.setFieldValue('rollMode', 'manual');
    },
  };
}

export type StudentQuickSetupAcademicEditor = ReturnType<typeof useStudentQuickSetupAcademic>;
