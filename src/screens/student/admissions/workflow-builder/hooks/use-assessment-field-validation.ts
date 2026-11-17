import { useState } from 'react';

export type AssessmentFieldValidation = {
  showError: (key: string) => boolean;
  onBlur: (key: string) => void;
};

type FieldState = { createdAtAttempt: number; touched: boolean };

/** Interaction metadata lives with the configuration, keyed by stable profile/subject identities. */
export function useAssessmentFieldValidation(
  submitCount: number,
  fieldKeys: string[]
): AssessmentFieldValidation {
  const [state, setState] = useState(() => ({
    submitCount,
    fields: Object.fromEntries(
      fieldKeys.map((key) => [key, { createdAtAttempt: submitCount, touched: false }])
    ) as Record<string, FieldState>,
  }));
  // Register a genuinely new row before rendering its fields. Retain existing metadata while
  // a profile is collapsed or a scoring/pass mode temporarily hides its controls.
  let { fields } = state;
  if (submitCount < state.submitCount || fieldKeys.some((key) => !fields[key])) {
    fields = submitCount < state.submitCount ? {} : { ...fields };
    fieldKeys.forEach((key) => {
      fields[key] ??= { createdAtAttempt: submitCount, touched: false };
    });
    setState({ submitCount, fields });
  } else if (submitCount !== state.submitCount) {
    setState({ ...state, submitCount });
  }
  return {
    showError: (key) =>
      Boolean(fields[key] && (fields[key].touched || submitCount > fields[key].createdAtAttempt)),
    onBlur: (key) =>
      setState((current) => ({
        ...current,
        fields: {
          ...current.fields,
          [key]: {
            createdAtAttempt: current.fields[key]?.createdAtAttempt ?? submitCount,
            touched: true,
          },
        },
      })),
  };
}
