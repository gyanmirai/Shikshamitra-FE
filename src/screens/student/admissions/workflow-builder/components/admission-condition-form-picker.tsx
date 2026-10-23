import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Button, Typography, LinearProgress } from '@mui/material';
import { emptyCondition } from 'src/redux/student/admissions/admission-condition-rule';
import { useGetAdmissionFormQuery } from 'src/redux/student/admissions/admission-forms-api';

import { getTypedConditionFields } from './admission-condition-fields';
import { AdmissionConditionEditor } from './admission-condition-editor';
import {
  hasInquiryCondition,
  INQUIRY_RULE_REPLACEMENT_MESSAGE,
} from '../workflow-inquiry-retirement';

import type { AdmissionConditionField } from './admission-condition-fields';

export function AdmissionConditionFormPicker({
  forms,
  json,
  onChange,
  formDefinitionId,
  onFormDefinitionChange,
  readOnly = false,
  strictTypes = false,
  groupLabel,
  getFields = getTypedConditionFields,
}: {
  forms: AdmissionForm[];
  json?: string | null;
  onChange: (json: string) => void;
  source?: 'application';
  formDefinitionId?: string;
  onFormDefinitionChange?: (id: string) => void;
  readOnly?: boolean;
  strictTypes?: boolean;
  groupLabel?: string;
  getFields?: (form: AdmissionForm | undefined, source: 'application') => AdmissionConditionField[];
}) {
  const [localFormId, setLocalFormId] = useState('');
  const formId = formDefinitionId ?? localFormId;
  const legacyInquiry = hasInquiryCondition(json);
  const query = useGetAdmissionFormQuery(formId, { skip: !formId || legacyInquiry });
  const detail = query.currentData;
  if (legacyInquiry) {
    return (
      <Stack spacing={1}>
        <StudentFeedback notificationKey="STU-0501" presentation="inline" severity="info">
          {INQUIRY_RULE_REPLACEMENT_MESSAGE} The saved rule remains unchanged until you replace it.
        </StudentFeedback>
        {!readOnly && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => onChange(JSON.stringify(emptyCondition()))}
          >
            Replace inquiry condition
          </Button>
        )}
      </Stack>
    );
  }
  return (
    <Stack spacing={1}>
      <CustomSelect
        size="small"
        fullWidth
        label="Published form for answer choices"
        value={formId}
        disabled={readOnly}
        options={[
          {
            value: '',
            label: strictTypes ? 'Choose a published form' : 'Enter a known field directly',
          },
          ...forms
            .filter((form) => form.status === 1 && form.purpose !== 0)
            .map((form) => ({ value: form.id, label: `${form.name} · v${form.version}` })),
        ]}
        onChange={(id) =>
          onFormDefinitionChange ? onFormDefinitionChange(String(id)) : setLocalFormId(String(id))
        }
        helperText={
          strictTypes
            ? 'Use the published form that collects this answer. Changing the form clears its previous rule.'
            : 'Choose the published form used for this answer source. This changes suggestions only; saved conditions stay unchanged.'
        }
      />
      {formId && query.isFetching && <LinearProgress aria-label="Loading published form fields" />}
      {formId && query.isError && (
        <StudentFeedback
          notificationKey="STU-0502"
          presentation="persistent"
          severity="warning"
          action={
            <Button size="small" onClick={query.refetch}>
              Retry
            </Button>
          }
        >
          {strictTypes
            ? 'Fields for the selected form could not load. Retry before configuring this criterion.'
            : 'Fields for the selected form could not load. Retry or enter a known field directly.'}
        </StudentFeedback>
      )}
      {detail &&
        !query.isError &&
        detail.sections.every((section) => section.fields.length === 0) && (
          <Typography variant="body2" color="text.secondary">
            This published form has no answer fields. Choose another form.
          </Typography>
        )}
      <AdmissionConditionEditor
        json={json}
        readOnly={readOnly || (strictTypes && (!detail || query.isFetching || query.isError))}
        strictTypes={strictTypes}
        groupLabel={groupLabel}
        onChange={onChange}
        fields={getFields(
          detail && !query.isError && detail.purpose !== 0 ? detail : undefined,
          'application'
        )}
      />
      <Typography variant="caption" color="text.secondary">
        A missing field pauses this requirement. “Is empty” matches an answer explicitly saved
        blank.
      </Typography>
    </Stack>
  );
}
