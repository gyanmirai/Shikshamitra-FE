import type { RecordChange } from 'src/redux/student/records/student-record-changes-api';
import type { AdmissionFormOption } from 'src/redux/student/admissions/admission-forms-api';
import type {
  RecordFieldOptionsInput,
  RecordRegistrationSource,
} from 'src/redux/student/records/student-record-details-api';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { profileFieldValue } from 'src/screens/student/studentProfile/student-record-profile-model';
import { isAdmissionSiblingField } from 'src/screens/student/admissions/admission-sibling-runtime-field';
import { useLazyGetStudentRecordFieldOptionsQuery } from 'src/redux/student/records/student-record-details-api';
import { parseRuntimeOptionsSource } from 'src/screens/student/admissions/application-detail/application-runtime-options';

import { recordDiffValue, recordFieldLabel } from './record-diff';

export function profileChangeDiff(change: RecordChange, sources: RecordRegistrationSource[]) {
  if (change.payloadMasked || !change.before || !change.proposed) return [];
  if (['custom-details', 'registration-form'].includes(change.section)) {
    const before = (change.before.sources ?? []) as {
      applicationId: string;
      values: Record<string, unknown>;
    }[];
    const after = (change.proposed.sources ?? []) as typeof before;
    return after.flatMap((source) => {
      const previous =
        before.find((item) => item.applicationId === source.applicationId)?.values ?? {};
      const registration = sources.find((item) => item.applicationId === source.applicationId);
      const definition = registration?.definition;
      return Object.entries(source.values)
        .filter(([code, value]) => JSON.stringify(value) !== JSON.stringify(previous[code]))
        .map(([code, value]) => {
          const field = definition?.sections
            .flatMap((section) => section.fields)
            .find((item) => item.code === code);
          const options = registration?.optionsByField?.[code];
          return {
            label: field?.label ?? recordFieldLabel(code),
            before: field ? profileFieldValue(field, previous[code], options) : 'Value unavailable',
            after: field ? profileFieldValue(field, value, options) : 'Value unavailable',
          };
        });
    });
  }
  return Object.entries(change.proposed)
    .filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(change.before?.[key]))
    .map(([key, value]) => ({
      label: recordFieldLabel(key),
      before: recordDiffValue(key, change.before?.[key]),
      after: recordDiffValue(key, value),
    }));
}

const optionKey = (submissionId: string, code: string) => `${submissionId}::${code}`;
const guid = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
function selectedReferences(value: unknown): string[] {
  return Array.isArray(value)
    ? value.flatMap(selectedReferences)
    : typeof value === 'string' && guid.test(value)
      ? [value]
      : [];
}

/** Resolve only changed reference labels through the owning Records boundary. */
export function useProfileChangeDiff(
  change: RecordChange | undefined,
  sources: RecordRegistrationSource[]
) {
  const [load] = useLazyGetStudentRecordFieldOptionsQuery();
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    key: string;
    loading: boolean;
    error: boolean;
    options: Record<string, AdmissionFormOption[]>;
  }>({ key: '', loading: false, error: false, options: {} });
  const inputs: RecordFieldOptionsInput[] = [];
  if (
    change &&
    ['custom-details', 'registration-form'].includes(change.section) &&
    !change.payloadMasked &&
    change.before &&
    change.proposed
  ) {
    const before = (change.before.sources ?? []) as {
      applicationId: string;
      values: Record<string, unknown>;
    }[];
    const proposed = (change.proposed.sources ?? []) as typeof before;
    proposed.forEach((item) => {
      const source = sources.find((candidate) => candidate.applicationId === item.applicationId);
      if (!source?.definition) return;
      const previous =
        before.find((candidate) => candidate.applicationId === item.applicationId)?.values ?? {};
      Object.entries(item.values).forEach(([code, value]) => {
        if (JSON.stringify(value) === JSON.stringify(previous[code])) return;
        const field = source.definition?.sections
          .flatMap((section) => section.fields)
          .find((candidate) => candidate.code === code);
        const configuration = parseRuntimeOptionsSource(field?.optionsJson);
        if (!field || (!configuration && !isAdmissionSiblingField(field))) return;
        const selectedIds = [
          ...new Set([...selectedReferences(value), ...selectedReferences(previous[code])]),
        ];
        if (!selectedIds.length) return;
        const parent = configuration?.parentField
          ? (item.values[configuration.parentField] ??
            source.currentValues[configuration.parentField])
          : undefined;
        for (let offset = 0; offset < selectedIds.length; offset += 20) {
          inputs.push({
            studentId: change.studentId,
            submissionId: source.submissionId,
            fieldCode: code,
            parentId: typeof parent === 'string' && guid.test(parent) ? parent : undefined,
            selectedIds: selectedIds.slice(offset, offset + 20),
            selectedOnly: true,
          });
        }
      });
    });
  }
  const key = JSON.stringify(inputs);
  const requests = useMemo(() => JSON.parse(key) as RecordFieldOptionsInput[], [key]);
  useEffect(() => {
    if (!requests.length) return undefined;
    let cancelled = false;
    setState({ key, loading: true, error: false, options: {} });
    Promise.all(
      requests.map(
        async (input) =>
          [
            optionKey(input.submissionId, input.fieldCode),
            await load(input, revision === 0).unwrap(),
          ] as const
      )
    )
      .then((options) => {
        const resolved: Record<string, AdmissionFormOption[]> = {};
        options.forEach(([fieldKey, choices]) => {
          resolved[fieldKey] = [...(resolved[fieldKey] ?? []), ...choices];
        });
        if (!cancelled) setState({ key, loading: false, error: false, options: resolved });
      })
      .catch(() => {
        if (!cancelled) setState({ key, loading: false, error: true, options: {} });
      });
    return () => {
      cancelled = true;
    };
  }, [key, requests, load, revision]);
  const hydrated = sources.map((source) => ({
    ...source,
    optionsByField: {
      ...source.optionsByField,
      ...Object.fromEntries(
        (source.definition?.sections.flatMap((section) => section.fields) ?? []).flatMap(
          (field) => {
            const options =
              state.key === key
                ? state.options[optionKey(source.submissionId, field.code)]
                : undefined;
            return options ? [[field.code, options]] : [];
          }
        )
      ),
    },
  }));
  return {
    diffs: change ? profileChangeDiff(change, hydrated) : [],
    isLoading: requests.length > 0 && (state.key !== key || state.loading),
    isError: requests.length > 0 && state.key === key && state.error,
    retry: useCallback(() => setRevision((value) => value + 1), []),
  };
}
