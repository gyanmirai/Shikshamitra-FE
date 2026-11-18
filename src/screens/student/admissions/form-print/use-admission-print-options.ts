import { useState, useEffect } from 'react';
import { useLazyGetAdmissionFormOptionsQuery } from 'src/redux/student/admissions/admission-forms-api';

import { readRepeatableValues } from '../form-repeatable-values';
import { academicOptionsJson } from '../admission-academic-options';
import { readAdmissionFormValue } from '../admission-visibility-rules';
import { parseRuntimeOptionsSource } from '../application-detail/application-runtime-options';

import type { AdmissionPrintDefinition } from './form-print-model';

/** Runtime strings are JSON-serialized on save; older arrays may already be raw JSON. */
function storedChoiceValue(value?: string) {
  if (!value) return '';
  try {
    const decoded: unknown = JSON.parse(value);
    return typeof decoded === 'string' ? decoded : value;
  } catch {
    return value;
  }
}

export function useAdmissionPrintOptions(
  definition: AdmissionPrintDefinition,
  values: Record<string, string>,
  enabled: boolean,
  academicYearId?: string,
  printableFieldCodes?: string[]
) {
  const [load] = useLazyGetAdmissionFormOptionsQuery();
  const requests = enabled
    ? definition.sections.flatMap((section) =>
        section.fields.flatMap((field) => {
          if (printableFieldCodes && !printableFieldCodes.includes(field.code)) return [];
          const source = parseRuntimeOptionsSource(academicOptionsJson(field));
          if (!source) return [];
          const rows = section.isRepeatable
            ? readRepeatableValues(storedChoiceValue(values[field.code]))
            : [storedChoiceValue(values[field.code])];
          const parentRows =
            section.isRepeatable && source.parentField
              ? readRepeatableValues(storedChoiceValue(values[source.parentField]))
              : [];
          return rows.flatMap((value, index) => {
            if (!readAdmissionFormValue(value)) return [];
            let selectedIds: string[] | undefined;
            if (source.source === 'StudentSiblings') {
              try {
                const parsed: unknown = JSON.parse(value);
                selectedIds = Array.isArray(parsed)
                  ? parsed.filter((item): item is string => typeof item === 'string')
                  : [String(parsed)];
              } catch {
                selectedIds = [value];
              }
            }
            return [
              {
                fieldCode: field.code,
                sourceKey: source.source,
                parentId: source.parentField
                  ? readAdmissionFormValue(
                      parentRows.length ? parentRows[index] : values[source.parentField]
                    ) || undefined
                  : undefined,
                academicYearId,
                ...(selectedIds ? { selectedIds } : {}),
              },
            ];
          });
        })
      )
    : [];
  const key = JSON.stringify(requests);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    key: string;
    labels: Record<string, Record<string, string>>;
    error: boolean;
    unavailable?: boolean;
  }>({ key: '[]', labels: {}, error: false });
  useEffect(() => {
    const inputs = JSON.parse(key) as typeof requests;
    if (!inputs.length) return undefined;
    let active = true;
    const cache = new Map<
      string,
      Promise<{ labels: Record<string, string>; unavailable: boolean }>
    >();
    Promise.all(
      inputs.map(async ({ fieldCode, ...query }) => {
        const requestKey = JSON.stringify(query);
        let pending = cache.get(requestKey);
        if (!pending) {
          pending = load(query, true)
            .unwrap()
            .then((options) => ({
              labels: Object.fromEntries(options.map((option) => [option.value, option.label])),
              unavailable: false,
            }))
            .catch((error) => {
              // Form catalogue permission is deliberately stronger than application viewing.
              // Do not expose IDs or block unrelated answers when a sibling label is restricted.
              if (query.sourceKey === 'StudentSiblings' && error?.status === 403)
                return { labels: {}, unavailable: true };
              throw error;
            });
          cache.set(requestKey, pending);
        }
        return [fieldCode, await pending] as const;
      })
    )
      .then((entries) => {
        const labels: Record<string, Record<string, string>> = {};
        let unavailable = false;
        entries.forEach(([code, choices]) => {
          unavailable ||= choices.unavailable;
          labels[code] = { ...labels[code], ...choices.labels };
        });
        if (active) setState({ key, labels, error: false, unavailable });
      })
      .catch(() => {
        if (active) setState({ key, labels: {}, error: true });
      });
    return () => {
      active = false;
    };
  }, [key, load, revision]);
  return {
    labels: key === '[]' ? {} : state.key === key ? state.labels : {},
    loading: key !== '[]' && state.key !== key,
    error: key !== '[]' && state.key === key && state.error,
    unavailable: key !== '[]' && state.key === key && Boolean(state.unavailable),
    retry: () => {
      setState({ key: '', labels: {}, error: false });
      setRevision((value) => value + 1);
    },
  };
}
