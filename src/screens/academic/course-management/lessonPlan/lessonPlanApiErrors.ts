import { lessonPlanTextFields } from './lessonPlanTextValidation';

import type { LessonPlanTextField, LessonPlanTextErrors } from './lessonPlanTextValidation';

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

export function getLessonPlanTextApiErrors(error: unknown): LessonPlanTextErrors {
  const data = asRecord(asRecord(error)?.data);
  const nestedError = asRecord(data?.error);
  const result: LessonPlanTextErrors = {};
  const append = (path: string, value: unknown) => {
    const member = path.split('.').at(-1)?.toLowerCase();
    const field = (Object.keys(lessonPlanTextFields) as LessonPlanTextField[]).find(
      (key) => key.toLowerCase() === member
    );
    const messages = (Array.isArray(value) ? value : [value])
      .filter((item): item is string => typeof item === 'string' && !!item.trim())
      .map((item) => item.trim());
    if (field && messages.length) {
      result[field] = [result[field], ...messages].filter(Boolean).join(' ');
    }
  };

  [asRecord(data?.errors), asRecord(nestedError?.errors)].forEach((dictionary) => {
    Object.entries(dictionary ?? {}).forEach(([path, messages]) => append(path, messages));
  });
  [data?.validationErrors, nestedError?.validationErrors].forEach((entries) => {
    if (!Array.isArray(entries)) return;
    entries.forEach((entry) => {
      const record = asRecord(entry);
      const members = record?.members ?? record?.memberNames;
      if (!Array.isArray(members)) return;
      members.forEach((member) => {
        if (typeof member === 'string') append(member, record?.message ?? record?.errorMessage);
      });
    });
  });
  return result;
}
