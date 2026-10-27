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

import { getOnboardingMessage } from './student-onboarding-messages';
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
type RetainedPage = Pick<Baseline, 'rows' | 'contextKey' | 'type' | 'totalCount'>;
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
  const [automaticPage, setAutomaticPage] = useState<RetainedPage | null>(null);
  const retainedPage =
    automaticPage?.contextKey === contextKey && automaticPage.type === type ? automaticPage : null;
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
  useEffect(() => {
    setAutomaticPage(null);
  }, [contextKey, type]);

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
          setResults((current) => [
            ...current,
            {
              ...result,
              message: getOnboardingMessage(result.message, 'Review this student and try again.'),
            },
          ]);
          if (result.updatedStudent)
            setAutomaticPage((current) =>
              current?.contextKey === contextKey && current.type === type
                ? {
                    ...current,
                    rows: current.rows.map((row) =>
                      row.id === result.student.id ? result.updatedStudent! : row
                    ),
                  }
                : current
            );
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
              .required(type === 'division' ? 'Select a division.' : 'Enter a number.');
            if (type === 'roll-number')
              field = field.test(
                'positive-roll',
                'Enter a positive whole roll number.',
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
            ? reason.required('Explain why this number needs to change.')
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

  const currentRows = useMemo(
    () => (retainedPage?.rows ?? rows).map((row) => overrides[row.id] ?? row),
    [retainedPage?.rows, rows, overrides]
  );
  const displayedRows = useMemo(
    () => (baseline?.rows ?? retainedPage?.rows ?? rows).map((row) => overrides[row.id] ?? row),
    [baseline?.rows, retainedPage?.rows, rows, overrides]
  );
  // Pending queries remove saved rows and backfill the page. Keep this operation's page stable.
  const retainAutomaticPage = () => {
    if (type !== 'gr-number' && type !== 'roll-number') return;
    setAutomaticPage((current) =>
      current?.contextKey === contextKey && current.type === type
        ? current
        : { rows: currentRows, totalCount, contextKey, type }
    );
  };
  const applyRollBatchRows = (
    items: { studentId: string; proposedRollNumber?: number | null }[]
  ) => {
    const numbers = new Map(items.map((item) => [item.studentId, item.proposedRollNumber]));
    const updateRow = (row: StudentOnboardingItem) => {
      const rollNo = row.studentId ? numbers.get(row.studentId) : undefined;
      return Number.isInteger(rollNo) && Number(rollNo) > 0 ? { ...row, rollNo } : row;
    };
    setAutomaticPage((current) =>
      current?.contextKey === contextKey && current.type === 'roll-number'
        ? {
            ...current,
            rows: current.rows.map(updateRow),
          }
        : current
    );
    setOverrides((current) =>
      Object.fromEntries(Object.entries(current).map(([id, row]) => [id, updateRow(row)]))
    );
  };
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
    setBaseline({
      rows: currentRows,
      values,
      ids,
      contextKey,
      type,
      totalCount: retainedPage?.totalCount ?? totalCount,
    });
    form.resetForm({ values: { values, reason: '' } });
    setResults([]);
  };
  const cancel = () => {
    if (busyRef.current) return;
    setBaseline(null);
    form.resetForm();
    setResults([]);
  };
  const runAutomatic = (targetRows: StudentOnboardingItem[], divisionId?: string) => {
    if (!type || !canManage || busyRef.current || !targetRows.length) return Promise.resolve([]);
    retainAutomaticPage();
    return run(
      'automatic',
      targetRows.map((student) => ({
        student,
        baselineValue: type ? getStudentSetupAssignmentValue(student, type) : null,
      })),
      divisionId
    );
  };
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
              getOnboardingMessage(
                getStudentSetupAssignmentEligibility(row, type, 'manual', grAssignmentMode).reason,
                'Not selected for editing.'
              ),
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
    retainAutomaticPage,
    applyRollBatchRows,
    clearResults: () => setResults([]),
    manualEditing: Boolean(baseline),
    contextChanged,
    editableIds: baseline?.ids ?? [],
    manualErrors,
    manualBlockers,
    displayedRows,
    displayedTotalCount: baseline?.totalCount ?? retainedPage?.totalCount ?? totalCount,
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
