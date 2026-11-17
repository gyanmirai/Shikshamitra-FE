import type { AdmissionAssessmentSubjectPolicy } from 'src/redux/student/admissions/admission-assessment-policy';
import type { AdmissionAssessmentSubjectOption } from 'src/redux/student/admissions/admission-assessment-catalog-api';

import { useState } from 'react';
import { uuidv4 } from 'src/utils/uuidv4';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Stack, Button, Typography } from '@mui/material';

import { WorkflowSettingLabel } from './workflow-setting-label';
import { WorkflowAssessmentSubjectFields } from './workflow-assessment-subject-fields';

import type { AssessmentFieldValidation } from '../hooks/use-assessment-field-validation';

export function WorkflowAssessmentSubjects({
  subjects,
  profileId,
  options,
  mediumId,
  standardIds,
  perSubjectPass,
  disabled,
  catalogUnavailable,
  validation,
  onChange,
}: {
  subjects: AdmissionAssessmentSubjectPolicy[];
  profileId: string;
  options: AdmissionAssessmentSubjectOption[];
  mediumId: string;
  standardIds: string[];
  perSubjectPass: boolean;
  disabled: boolean;
  catalogUnavailable: boolean;
  validation: AssessmentFieldValidation;
  onChange: (subjects: AdmissionAssessmentSubjectPolicy[]) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const update = (index: number, changes: Partial<AdmissionAssessmentSubjectPolicy>) =>
    onChange(subjects.map((subject, i) => (i === index ? { ...subject, ...changes } : subject)));
  const selected = subjects.flatMap((subject) => (subject.subjectId ? [subject.subjectId] : []));
  const available = options.filter((subject) => subject.mediumId === mediumId);
  const suggested = (subject: AdmissionAssessmentSubjectOption) =>
    subject.assignedStandardIds.some((id) => standardIds.includes(id));
  const ordered = [...available].sort(
    (a, b) => Number(suggested(b)) - Number(suggested(a)) || a.name.localeCompare(b.name)
  );
  const add = (subject?: AdmissionAssessmentSubjectOption) => {
    onChange([
      ...subjects,
      {
        code: uuidv4(),
        subjectId: subject?.id ?? null,
        name: subject?.name ?? '',
        totalMarks: 0,
        passingMarks: null,
      },
    ]);
    setShowPicker(false);
  };

  return (
    <Stack spacing={1}>
      <Typography component="h3" variant="subtitle2">
        <WorkflowSettingLabel
          label="Subjects"
          help="Marks are required for every subject before submitting the combined result. School subjects suggested for the selected classes appear first; you may choose other subjects in the same medium or add a custom entrance-only subject."
        />
      </Typography>
      {subjects.map((subject, index) => (
        <WorkflowAssessmentSubjectFields
          key={subject.code}
          subject={subject}
          index={index}
          available={available}
          disabled={disabled}
          catalogUnavailable={catalogUnavailable}
          perSubjectPass={perSubjectPass}
          validation={validation}
          fieldKey={`${profileId}:${subject.code}`}
          onChange={(changes) => update(index, changes)}
          onRemove={() => onChange(subjects.filter((_, i) => i !== index))}
        />
      ))}
      {subjects.length === 0 && (
        <Typography
          variant="body2"
          color={validation.showError(`${profileId}:subjects`) ? 'error.main' : 'text.secondary'}
        >
          {validation.showError(`${profileId}:subjects`)
            ? 'Add at least one subject to this class profile.'
            : 'No subjects added.'}
        </Typography>
      )}
      {showPicker && (
        <CustomSelect
          fullWidth
          size="small"
          isSearch
          label="School Subject"
          disabled={disabled || catalogUnavailable || !mediumId}
          value=""
          options={ordered.map((subject) => ({
            value: subject.id,
            label: `${subject.name}${suggested(subject) ? ' · For selected classes' : ''}`,
          }))}
          disabledValues={selected}
          disabledLabel="Already added"
          onChange={(id) => {
            const subject = available.find((option) => option.id === id);
            if (subject) add(subject);
          }}
          noOptionsMessage="No Active School Subjects for This Medium. Add a Custom Subject or Check Academic Setup."
        />
      )}
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.addIcon} />}
          disabled={disabled || catalogUnavailable || !mediumId}
          onClick={() => setShowPicker((value) => !value)}
        >
          {showPicker ? 'Close Subject Selector' : 'Add School Subject'}
        </Button>
        <Button
          aria-label="Add Custom Subject"
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.addIcon} />}
          disabled={disabled || !mediumId}
          onClick={() => add()}
        >
          Custom Subject
        </Button>
      </Stack>
    </Stack>
  );
}
