import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionDocumentTypeOption } from 'src/redux/student/admissions/admission-document-settings-api';
import type { AdmissionDocumentRequirementPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Stack, Button, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { createDocumentRequirement } from 'src/redux/student/admissions/admission-document-policy';

import { DocumentRequirementItem } from './document-requirement-item';
import { DocumentRequirementDialog } from './document-requirement-dialog';

const presets = [
  { value: 'BIRTH_CERTIFICATE', label: 'Birth certificate' },
  { value: 'TRANSFER_CERTIFICATE', label: 'Transfer certificate' },
  { value: 'PREVIOUS_REPORT', label: 'Previous school report' },
  { value: 'ADDRESS_PROOF', label: 'Address proof' },
  { value: 'STUDENT_PHOTO', label: 'Student photograph' },
];
type Props = {
  requirements: AdmissionDocumentRequirementPolicy[];
  onChange: (requirements: AdmissionDocumentRequirementPolicy[]) => void;
  readOnly: boolean;
  forms: AdmissionForm[];
  documentTypes: AdmissionDocumentTypeOption[];
};
export function DocumentRequirementsList({ requirements, onChange, readOnly, ...props }: Props) {
  const [editing, setEditing] = useState<{
    index: number;
    value: AdmissionDocumentRequirementPolicy;
  } | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const addCustom = () => {
    const codes = new Set(requirements.map((item) => item.code));
    let next = 1;
    while (codes.has(`DOCUMENT_${next}`)) next += 1;
    setEditing({ index: -1, value: createDocumentRequirement(`DOCUMENT_${next}`) });
  };
  return (
    <Stack spacing={1}>
      {requirements.length >= 25 && (
        <Typography variant="caption" color="text.secondary">
          {requirements.length} of 30 documents
        </Typography>
      )}
      {!requirements.length && (
        <Typography variant="body2" color="text.secondary">
          Add a standard or custom document to build the applicant checklist.
        </Typography>
      )}
      {requirements.map((item, index) => (
        <DocumentRequirementItem
          key={item.code}
          item={item}
          readOnly={readOnly}
          onEdit={() => setEditing({ index, value: item })}
          onRemove={() => setRemoving(index)}
        />
      ))}
      {!readOnly && (
        <>
          <CustomSelect
            size="small"
            fullWidth
            label="Add a standard document"
            value=""
            options={presets}
            disabled={requirements.length >= 30}
            disabledValues={requirements.map((item) => item.code)}
            onChange={(code) => {
              const preset = presets.find((item) => item.value === code);
              if (preset)
                setEditing({
                  index: -1,
                  value: createDocumentRequirement(preset.value, preset.label),
                });
            }}
          />
          <Button
            size="small"
            variant="outlined"
            disabled={requirements.length >= 30}
            onClick={addCustom}
          >
            Add custom document
          </Button>
        </>
      )}
      {editing && (
        <DocumentRequirementDialog
          {...props}
          initial={editing.value}
          existingCodes={requirements
            .filter((_, index) => index !== editing.index)
            .map((item) => item.code)}
          onClose={() => setEditing(null)}
          onSave={(value) =>
            onChange(
              editing.index < 0
                ? [...requirements, value]
                : requirements.map((item, index) => (index === editing.index ? value : item))
            )
          }
        />
      )}
      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Remove document requirement?"
        content={`Remove ${removing !== null ? requirements[removing]?.name : 'this document'} from this draft checklist? Evidence on existing applications will remain available.`}
        action={
          <Button
            size="small"
            color="error"
            variant="contained"
            onClick={() => {
              onChange(requirements.filter((_, index) => index !== removing));
              setRemoving(null);
            }}
          >
            Remove requirement
          </Button>
        }
      />
    </Stack>
  );
}
