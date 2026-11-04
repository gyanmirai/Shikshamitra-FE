import type { AdmissionRuntimeFieldProps } from 'src/screens/student/admissions/admission-runtime-field';

import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { AdmissionAcademicMenuPaper } from 'src/screens/student/admissions/admission-board-class-field';
import { parseRuntimeOptionsSource } from 'src/screens/student/admissions/application-detail/application-runtime-options';

type Field = AdmissionRuntimeFieldProps['field'] & { optionsSourceJson?: string | null };
type AcademicContext = { boardId: string; mediumId: string; standardId: string };
type Choice = { value: string; label: string; isActive: boolean };

export function publicAcademicSource(field: Field) {
  const source = parseRuntimeOptionsSource(field.optionsSourceJson);
  return field.fieldType === 6 && (source?.source === 'EducationBoards' ||
    (['EducationMediums', 'StandardsByMedium'].includes(source?.source ?? '') && Boolean(source?.parentField?.trim())))
    ? source
    : null;
}

function boundedChoices(field: Field, offering: AcademicContext): Choice[] {
  const source = publicAcademicSource(field);
  const expectedId =
    source?.source === 'EducationBoards'
      ? offering.boardId
      : source?.source === 'EducationMediums'
        ? offering.mediumId
        : offering.standardId;
  try {
    const choices: unknown = JSON.parse(field.optionsJson || '[]');
    return Array.isArray(choices)
      ? choices
          .filter((item) => item && item.value === expectedId && typeof item.label === 'string')
          .map((item) => ({
            value: item.value,
            label: item.label,
            isActive: item.isActive !== false,
          }))
      : [];
  } catch {
    return [];
  }
}

function parentReady(field: Field, values: Record<string, string>, offering: AcademicContext) {
  const source = publicAcademicSource(field);
  if (source?.source === 'EducationBoards') return true;
  const expected = source?.source === 'EducationMediums' ? offering.boardId : offering.mediumId;
  return Boolean(source?.parentField && values[source.parentField] === expected);
}

export function publicAcademicError(
  field: Field,
  fields: Field[],
  values: Record<string, string>,
  offering: AcademicContext
) {
  const source = publicAcademicSource(field);
  if (!source || !values[field.code]) return undefined;
  if (!parentReady(field, values, offering)) {
    const label =
      fields.find((item) => item.code === source.parentField)?.label ?? 'the parent academic field';
    return `Select ${label} first.`;
  }
  return boundedChoices(field, offering).some(
    (option) => option.isActive && option.value === values[field.code]
  )
    ? undefined
    : `${field.label} contains an unavailable option.`;
}

/** Public choices are supplied by the authorized offering response; no staff queries run here. */
export function PublicAcademicField({
  field,
  fields,
  offering,
  value,
  disabled,
  error,
  formValues = {},
  onChange,
  onBlur,
}: Omit<AdmissionRuntimeFieldProps, 'field'> & {
  field: Field;
  fields: Field[];
  offering: AcademicContext;
}) {
  const source = publicAcademicSource(field)!;
  const ready = parentReady(field, formValues, offering);
  const choices = ready ? boundedChoices(field, offering) : [];
  if (value && !choices.some((option) => option.value === value))
    choices.push({ value, label: 'Saved value unavailable', isActive: false });
  const parentLabel =
    fields.find((item) => item.code === source.parentField)?.label ?? 'the parent academic field';
  return (
    <ShakingTextField error={Boolean(error)}>
      <CustomSelect
        name={field.code}
        label={field.label}
        required={field.required}
        size="small"
        fullWidth
        isSearch
        value={value}
        options={[{ value: '', label: 'None', isActive: true }, ...choices]}
        labelKey="label"
        valueKey="value"
        disabled={disabled || !ready}
        disabledValues={choices.filter((option) => !option.isActive).map((option) => option.value)}
        disabledLabel="Unavailable"
        noOptionsMessage="No options available for this admission choice"
        error={Boolean(error)}
        helperText={
          error || (!ready ? `Select ${parentLabel} first.` : field.helpText || undefined)
        }
        MenuProps={{ slots: { paper: AdmissionAcademicMenuPaper } }}
        onBlur={onBlur}
        onChange={(next) => onChange(String(next))}
      />
    </ShakingTextField>
  );
}
