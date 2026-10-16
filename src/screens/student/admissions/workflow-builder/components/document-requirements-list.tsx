import type { AdmissionDocumentTypeOption } from 'src/redux/student/admissions/admission-document-settings-api';
import type { AdmissionDocumentRequirementPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Stack, Button, Typography } from '@mui/material';
import { createDocumentRequirement } from 'src/redux/student/admissions/admission-document-policy';

import { DocumentRequirementItem } from './document-requirement-item';
import { DocumentRequirementDialog } from './document-requirement-dialog';

import type { DocumentCategoryQueryState } from './document-requirement-collection';

const presets = [
  { value: 'BIRTH_CERTIFICATE', label: 'Birth certificate' },
  { value: 'TRANSFER_CERTIFICATE', label: 'Transfer certificate' },
  { value: 'PREVIOUS_REPORT', label: 'Previous school report' },
  { value: 'ADDRESS_PROOF', label: 'Address proof' },
  { value: 'STUDENT_PHOTO', label: 'Student photograph' },
];
type Props = DocumentCategoryQueryState & {
  requirements: AdmissionDocumentRequirementPolicy[];
  onChange: (requirements: AdmissionDocumentRequirementPolicy[]) => void;
  readOnly: boolean;
  documentTypes: AdmissionDocumentTypeOption[];
};
export function DocumentRequirementsList({ requirements, onChange, readOnly, ...props }: Props) {
  const standardDocumentAnchor = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<{
    index: number;
    value: AdmissionDocumentRequirementPolicy;
  } | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const addCustom = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setEditing({ index: -1, value: createDocumentRequirement('') });
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
      <Stack component="ul" aria-label="Selected documents" spacing={1} sx={{ m: 0, p: 0 }}>
        {requirements.map((item, index) => (
          <DocumentRequirementItem
            key={`${item.code}-${index}`}
            item={item}
            readOnly={readOnly}
            onEdit={(event) => {
              setAnchorEl(event.currentTarget);
              setEditing({ index, value: item });
            }}
            onRemove={() => setRemoving(index)}
          />
        ))}
      </Stack>
      {!readOnly && (
        <>
          <Box ref={standardDocumentAnchor}>
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
                if (preset) {
                  setAnchorEl(standardDocumentAnchor.current);
                  setEditing({
                    index: -1,
                    value: createDocumentRequirement(preset.value, preset.label),
                  });
                }
              }}
            />
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:plus" />}
            sx={{ alignSelf: 'flex-start' }}
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
          anchorEl={anchorEl}
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
