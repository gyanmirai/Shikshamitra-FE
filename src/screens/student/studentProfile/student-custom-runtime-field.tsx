import type { RecordRegistrationSource } from 'src/redux/student/records/student-record-details-api';
import type { AdmissionRuntimeFieldProps } from 'src/screens/student/admissions/admission-runtime-field';
import type {
  AdmissionFormField,
  AdmissionFormOption,
} from 'src/redux/student/admissions/admission-forms-api';

import { useCallback } from 'react';
import { Stack, Button, Typography } from '@mui/material';
import AdmissionRuntimeField from 'src/screens/student/admissions/admission-runtime-field';
import { isAdmissionSiblingField } from 'src/screens/student/admissions/admission-sibling-runtime-field';
import { parseRuntimeOptionsSource } from 'src/screens/student/admissions/application-detail/application-runtime-options';
import { academicOptionsJson } from 'src/screens/student/admissions/admission-academic-options';
import {
  useGetStudentRecordFieldOptionsQuery,
  useLazyGetStudentRecordFieldOptionsQuery,
} from 'src/redux/student/records/student-record-details-api';

import { profileFieldOptions, typedRepeatableValues } from './student-record-profile-model';

export function StudentCustomRuntimeField({
  studentId,
  source,
  entryIndex,
  field,
  displayOnly = false,
  ...props
}: AdmissionRuntimeFieldProps & {
  studentId: string;
  source: RecordRegistrationSource;
  entryIndex?: number;
  field: AdmissionFormField;
  displayOnly?: boolean;
}) {
  const configured = parseRuntimeOptionsSource(academicOptionsJson(field));
  const sibling = isAdmissionSiblingField(field);
  const parentId = configured?.parentField ? props.formValues?.[configured.parentField] : undefined;
  const options = useGetStudentRecordFieldOptionsQuery(
    {
      studentId,
      submissionId: source.submissionId,
      fieldCode: field.code,
      parentId,
    },
    { skip: !configured || sibling || displayOnly }
  );
  const [load] = useLazyGetStudentRecordFieldOptionsQuery();
  const loadSiblingOptions = useCallback<
    NonNullable<AdmissionRuntimeFieldProps['loadSiblingOptions']>
  >(
    ({ sourceKey: _sourceKey, academicYearId: _year, ...input }) =>
      load({
        ...input,
        studentId,
        submissionId: source.submissionId,
        fieldCode: field.code,
        selectedOnly: Boolean(input.selectedIds?.length),
      }).unwrap(),
    [load, studentId, source.submissionId, field.code]
  );
  if (!configured || sibling)
    return (
      <AdmissionRuntimeField
        {...props}
        field={field}
        loadSiblingOptions={sibling ? loadSiblingOptions : undefined}
      />
    );
  const choices: AdmissionFormOption[] = displayOnly
    ? [...(profileFieldOptions(source, field.code, entryIndex) ?? [])]
    : [...(options.currentData ?? [])];
  const selected =
    field.fieldType === 7 ? typedRepeatableValues(props.value).map(String) : [props.value];
  const savedLabels = profileFieldOptions(source, field.code, entryIndex) ?? [];
  selected.filter(Boolean).forEach((value) => {
    if (!choices.some((option) => option.value === value))
      choices.push(
        savedLabels.find((option) => option.value === value) ?? {
          value,
          label: savedStaticLabel(field.optionsJson, value) ?? 'Option unavailable',
          displayOrder: 0,
          isActive: false,
        }
      );
  });
  return (
    <Stack spacing={0.5}>
      <AdmissionRuntimeField
        {...props}
        field={{ ...field, optionsJson: JSON.stringify(choices) }}
        optionsResolved
        disabled={props.disabled || (!displayOnly && (options.isFetching || options.isError))}
        error={
          props.error ||
          (!displayOnly && options.isError ? 'Options could not be loaded.' : undefined)
        }
      />
      {!displayOnly && options.isFetching && (
        <Typography variant="caption" role="status">
          Loading {field.label.toLowerCase()} options…
        </Typography>
      )}
      {!displayOnly && options.isError && (
        <Button disabled={props.disabled} onClick={() => options.refetch()}>
          Retry options
        </Button>
      )}
    </Stack>
  );
}

function savedStaticLabel(
  optionsJson: string | null | undefined,
  value: string
): string | undefined {
  try {
    const options: unknown = JSON.parse(optionsJson || '[]');
    if (!Array.isArray(options)) return undefined;
    const option = options.find((item) =>
      typeof item === 'string' ? item === value : item?.value === value
    );
    return typeof option === 'string'
      ? option
      : typeof option?.label === 'string'
        ? option.label
        : undefined;
  } catch {
    return undefined;
  }
}
