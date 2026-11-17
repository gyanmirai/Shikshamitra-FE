import type { ReactNode } from 'react';

import { useState } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { getAssessmentSubjectMaximumError } from 'src/redux/student/admissions/admission-assessment-policy';

import type { AssessmentFieldValidation } from '../hooks/use-assessment-field-validation';

// Keep an unfinished decimal or empty value visible while updating the owning configuration.
export function WorkflowAssessmentMarksField({
  label,
  fieldKey,
  ariaLabel,
  value,
  max,
  required = true,
  disabled,
  disabledHint,
  errorMessage,
  validation,
  positive = false,
  integer = false,
  onChange,
}: {
  label: ReactNode;
  fieldKey: string;
  ariaLabel?: string;
  value: number | null | undefined;
  max: number;
  required?: boolean;
  disabled: boolean;
  disabledHint?: string;
  errorMessage?: string;
  validation: AssessmentFieldValidation;
  positive?: boolean;
  integer?: boolean;
  onChange: (value: number | null) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const invalid =
    value == null ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > max ||
    (positive && value === 0) ||
    (integer && !Number.isInteger(value));
  const showError = !disabled && validation.showError(fieldKey) && invalid;
  const helperText =
    errorMessage ??
    (positive
      ? getAssessmentSubjectMaximumError(value ?? 0)
      : `Enter passing marks between zero and ${max}.`);
  return (
    <ShakingTextField error={showError}>
      <NumericFormatCustom
        size="small"
        fullWidth
        required={required}
        label={label}
        disabled={disabled}
        value={draft ?? value ?? ''}
        onBlur={() => {
          setDraft(null);
          validation.onBlur(fieldKey);
        }}
        prefix=""
        thousandSeparator={false}
        roundToWholeRupees={false}
        onChange={(event) => {
          const raw = event.target.value;
          if (!/^\d*(\.\d*)?$/.test(raw)) return;
          setDraft(raw);
          onChange(raw === '' ? null : Number(raw));
        }}
        slotProps={{
          htmlInput: {
            inputMode: integer ? 'numeric' : 'decimal',
            'aria-label': ariaLabel ?? (typeof label === 'string' ? label : undefined),
          },
        }}
        error={showError}
        helperText={disabled ? disabledHint : showError ? helperText : undefined}
      />
    </ShakingTextField>
  );
}
