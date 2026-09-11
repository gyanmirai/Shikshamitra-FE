import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Alert, Stack, Button, Typography, LinearProgress } from '@mui/material';
import { useGetAdmissionFormQuery } from 'src/redux/student/admissions/admission-forms-api';

import { getTypedConditionFields } from './admission-condition-fields';
import { AdmissionConditionEditor } from './admission-condition-editor';

import type { AdmissionConditionField } from './admission-condition-fields';

export function AdmissionConditionFormPicker({
  forms,
  json,
  onChange,
  source: controlledSource,
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
  source?: 'application' | 'inquiry';
  formDefinitionId?: string;
  onFormDefinitionChange?: (id: string) => void;
  readOnly?: boolean;
  strictTypes?: boolean;
  groupLabel?: string;
  getFields?: (
    form: AdmissionForm | undefined,
    source: 'application' | 'inquiry'
  ) => AdmissionConditionField[];
}) {
  const [localFormId, setLocalFormId] = useState('');
  const [localSource, setLocalSource] = useState<'application' | 'inquiry'>('application');
  const formId = formDefinitionId ?? localFormId;
  const source = controlledSource ?? localSource;
  const query = useGetAdmissionFormQuery(formId, { skip: !formId });
  const detail = query.currentData;
  return (
    <Stack spacing={1}>
      {!controlledSource && (
        <CustomSelect
          size="small"
          fullWidth
          label="Answer source"
          value={source}
          options={[
            { value: 'application', label: 'Application answer' },
            { value: 'inquiry', label: 'Inquiry answer' },
          ]}
          disabled={readOnly}
          onChange={(value) => setLocalSource(value === 'inquiry' ? 'inquiry' : 'application')}
        />
      )}
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
            .filter((form) => form.status === 1)
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
        <Alert
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
        </Alert>
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
        fields={getFields(detail && !query.isError ? detail : undefined, source)}
      />
      <Typography variant="caption" color="text.secondary">
        A missing field pauses this requirement. “Is empty” matches an answer explicitly saved
        blank.
      </Typography>
    </Stack>
  );
}
