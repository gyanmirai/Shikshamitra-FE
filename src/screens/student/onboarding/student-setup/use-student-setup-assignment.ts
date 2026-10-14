'use client';


import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useMemo, useState, useEffect } from 'react';
import {
  useAssignStudentOnboardingGrMutation,
  useLazyGetStudentOnboardingCaseQuery,
  useAssignStudentOnboardingRollMutation,
  usePreviewStudentOnboardingRollMutation,
  useSetStudentOnboardingPlacementMutation,
  useLazyGetAvailableStudentIdentifierSeriesQuery,
} from 'src/redux/student/onboarding/student-onboarding-api';

import {
  runStudentSetupAssignment,
  getStudentSetupAssignmentValue,
  studentSetupAssignmentNeedsReason,
  getStudentSetupAssignmentEligibility,
} from './student-setup-assignment-model';

import type { StudentOnboardingItem } from './student-onboarding-model';
import type { AssignmentModePolicy } from '../onboarding-settings-model';
import type {
  StudentSetupAssignmentType,
  StudentSetupAssignmentResult,
} from './student-setup-assignment-model';

type Draft = { values: Record<string, string>; reason: string };
type Baseline = {
  rows: StudentOnboardingItem[];
  values: Record<string, string>;
  ids: string[];
  contextKey: string;
  type: StudentSetupAssignmentType;
  totalCount: number;
};
const toText = (student: StudentOnboardingItem, type: StudentSetupAssignmentType) =>
  String(getStudentSetupAssignmentValue(student, type) ?? '');

/** Owns the table draft; published rules and fresh case APIs remain authoritative. */
export function useStudentSetupAssignment({
  rows,
  type,
  canManage,
  grAssignmentMode,
  contextKey = '',
  totalCount = rows.length,
}: {
  rows: StudentOnboardingItem[];
  type?: StudentSetupAssignmentType;
  canManage: boolean;
  grAssignmentMode?: AssignmentModePolicy;
  contextKey?: string;
  totalCount?: number;
}) {
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [results, setResults] = useState<StudentSetupAssignmentResult[]>([]);
  const [overrides, setOverrides] = useState<Record<string, StudentOnboardingItem>>({});
  const contextChanged = Boolean(
    baseline && (baseline.contextKey !== contextKey || baseline.type !== type)
  );
  const [getCase] = useLazyGetStudentOnboardingCaseQuery();
  const [getSeries] = useLazyGetAvailableStudentIdentifierSeriesQuery();
  const [assignGr] = useAssignStudentOnboardingGrMutation();
  const [assignRoll] = useAssignStudentOnboardingRollMutation();
  const [previewRoll] = usePreviewStudentOnboardingRollMutation();
  const [setPlacement] = useSetStudentOnboardingPlacementMutation();
  const services = useMemo(
    () => ({
      getCase: (id: string) => getCase(id, false).unwrap(),
      getSeries: (id: string) => getSeries(id, false).unwrap(),
      assignGr: (input: Parameters<typeof assignGr>[0]) => assignGr(input).unwrap(),
      previewRoll: (input: Parameters<typeof previewRoll>[0]) => previewRoll(input).unwrap(),
      assignRoll: (input: Parameters<typeof assignRoll>[0]) => assignRoll(input).unwrap(),
      setPlacement: (input: Parameters<typeof setPlacement>[0]) => setPlacement(input).unwrap(),
    }),
    [getCase, getSeries, assignGr, previewRoll, assignRoll, setPlacement]
  );

  // A newly fetched list supersedes temporary mutation responses, never the editing draft.
  useEffect(() => {
    if (!busyRef.current) setOverrides({});
  }, [rows]);

  const run = async (
    mode: 'automatic' | 'manual',
    items: Parameters<typeof runStudentSetupAssignment>[0]['items'],
    divisionId?: string
  ) => {
    if (!type || !canManage || busyRef.current) return [];
    busyRef.current = true;
    setBusy(true);
    setResults([]);
    try {
      return await runStudentSetupAssignment({
        type,
        mode,
        items,
        divisionId,
        grAssignmentMode,
        services,
        onResult: (result) => {
          setResults((current) => [...current, result]);
          if (result.updatedStudent)
            setOverrides((current) => ({
              ...current,
              [result.student.id]: result.updatedStudent!,
            }));
        },
      });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const form = useFormik<Draft>({
    initialValues: { values: {}, reason: '' },
    validationSchema: () =>
      Yup.lazy((draft: Draft) => {
        const changedRows =
          !baseline || !type
            ? []
            : baseline.rows.filter(
                (row) =>
                  baseline.ids.includes(row.id) &&
                  (draft.values?.[row.id] ?? '') !== baseline.values[row.id]
              );
        const fields = Object.fromEntries(
          changedRows.map((row) => {
            let field = Yup.string()
              .trim()
              .required(type === 'division' ? 'Choose a division.' : 'Enter a number.');
            if (type === 'roll-number')
              field = field.test(
                'positive-roll',
                'Enter a positive whole Roll number.',
                (value) =>
                  /^\d+$/.test(value ?? '') && Number(value) > 0 && Number(value) <= 2147483647
              );
            if (type === 'gr-number')
              field = field.max(100, 'GR number must be 100 characters or fewer.');
            return [row.id, field];
          })
        );
        const needsReason = Boolean(
          type && changedRows.some((row) => studentSetupAssignmentNeedsReason(row, type))
        );
        const reason = Yup.string().trim().max(1000, 'Reason must be 1000 characters or fewer.');
        return Yup.object({
          values: Yup.object(fields),
          reason: needsReason
            ? reason.required('Enter a reason for changing an existing number.')
            : reason,
        });
      }),
    onSubmit: async (draft) => {
      if (!baseline || !type || busyRef.current || contextChanged) return;
      const changedRows = baseline.rows.filter(
        (row) => baseline.ids.includes(row.id) && draft.values[row.id] !== baseline.values[row.id]
      );
      if (!changedRows.length) return;
      const completed = await run(
        'manual',
        changedRows.map((student) => ({
          student,
          value: draft.values[student.id],
          baselineValue: baseline.values[student.id],
          reason: draft.reason,
        }))
      );
      const accepted = completed.filter(
        (result) => result.status !== 'failed' && result.updatedStudent
      );
      const acceptedValues = Object.fromEntries(
        accepted.map((result) => [result.student.id, toText(result.updatedStudent!, type)])
      );
      const nextBaseline = { ...baseline.values, ...acceptedValues };
      const nextRows = baseline.rows.map(
        (row) => accepted.find((result) => result.student.id === row.id)?.updatedStudent ?? row
      );
      setBaseline({ ...baseline, rows: nextRows, values: nextBaseline });
      form.resetForm({ values: { values: nextBaseline, reason: '' } });
      // Keep failed edits dirty and available for deliberate retry; never repeat saved rows.
      form.setValues(
        {
          values: { ...draft.values, ...acceptedValues },
          reason: completed.some((result) => result.status === 'failed') ? draft.reason : '',
        },
        false
      );
    },
  });

  const currentRows = rows.map((row) => overrides[row.id] ?? row);
  const eligible = (mode: 'automatic' | 'manual', targetRows = currentRows) =>
    !type || !canManage
      ? []
      : targetRows.filter(
          (row) => getStudentSetupAssignmentEligibility(row, type, mode, grAssignmentMode).eligible
        );
  const startManual = (targetRows: StudentOnboardingItem[]) => {
    if (!type || !canManage || busyRef.current) return;
    const ids = eligible('manual', targetRows).map((row) => row.id);
    if (!ids.length) return;
    const values = Object.fromEntries(currentRows.map((row) => [row.id, toText(row, type)]));
    setBaseline({ rows: currentRows, values, ids, contextKey, type, totalCount });
    form.resetForm({ values: { values, reason: '' } });
    setResults([]);
  };
  const cancel = () => {
    if (busyRef.current) return;
    setBaseline(null);
    form.resetForm();
    setResults([]);
  };
  const runAutomatic = (targetRows: StudentOnboardingItem[], divisionId?: string) =>
    run(
      'automatic',
      targetRows.map((student) => ({
        student,
        baselineValue: type ? getStudentSetupAssignmentValue(student, type) : null,
      })),
      divisionId
    );
  const manualErrors = Object.fromEntries(
    Object.entries(form.errors.values ?? {}).filter(
      ([id]) => form.touched.values?.[id] || form.submitCount > 0
    )
  );
  const manualBlockers =
    type && baseline
      ? Object.fromEntries(
          baseline.rows
            .filter((row) => !baseline.ids.includes(row.id))
            .map((row) => [
              row.id,
              getStudentSetupAssignmentEligibility(row, type, 'manual', grAssignmentMode).reason ??
                'Not selected for editing.',
            ])
        )
      : {};
  return {
    form,
    busy: busy || form.isSubmitting,
    results,
    eligible,
    startManual,
    cancel,
    runAutomatic,
    clearResults: () => setResults([]),
    manualEditing: Boolean(baseline),
    contextChanged,
    editableIds: baseline?.ids ?? [],
    manualErrors,
    manualBlockers,
    displayedRows: (baseline?.rows ?? rows).map((row) => overrides[row.id] ?? row),
    displayedTotalCount: baseline?.totalCount ?? totalCount,
    needsReason: Boolean(
      type &&
      baseline?.rows.some(
        (row) =>
          baseline.ids.includes(row.id) &&
          form.values.values[row.id] !== baseline.values[row.id] &&
          studentSetupAssignmentNeedsReason(row, type)
      )
    ),
    changedCount:
      baseline?.ids.filter((id) => form.values.values[id] !== baseline.values[id]).length ?? 0,
    messages: Object.fromEntries(
      results.map((result) => [
        result.student.id,
        { status: result.status, message: result.message },
      ])
    ),
  };
}
