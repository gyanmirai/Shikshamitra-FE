import type { AdmissionFormSystemFieldMetadata } from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { fieldTypeIcon } from '../form-dialog-model';
import { PaletteFieldButton } from './palette-field-button';
import { groupStudentFields } from '../student-field-groups';

type Props = {
  fields: AdmissionFormSystemFieldMetadata[];
  usedBindings?: readonly string[];
  onAdd: (field: AdmissionFormSystemFieldMetadata) => void;
};

export function StudentFieldPalette({ fields, usedBindings = [], onAdd }: Props) {
  const [search, setSearch] = useState('');
  const normalizedSearch = search.trim().toLowerCase();
  const groupedFields = groupStudentFields(fields);
  const visibleGroups = groupedFields
    .map((group) => ({
      ...group,
      fields: group.fields.filter((field) =>
        `${field.displayName} ${field.key} ${group.name}`.toLowerCase().includes(normalizedSearch)
      ),
    }))
    .filter((group) => group.fields.length > 0);
  const used = new Set(usedBindings.map((key) => key.toLowerCase()));
  const availableCount = fields.filter((field) => !used.has(field.key.toLowerCase())).length;
  const visibleCount = visibleGroups.reduce((count, group) => count + group.fields.length, 0);
  return (
    <>
      <TextField
        fullWidth
        size="small"
        label="Search student fields"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="mdi:magnify" />
            </InputAdornment>
          ),
        }}
      />
      <Typography variant="caption" color="text.secondary">
        {normalizedSearch
          ? `${visibleCount} matching fields`
          : `${availableCount} available of ${fields.length} student fields`}
      </Typography>
      <Stack spacing={0.75} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
        {visibleGroups.map((group) => (
          <Stack key={group.name} spacing={0.75} sx={{ pb: 1 }}>
            <Typography variant="subtitle2" component="h3" sx={{ pt: 0.5 }}>
              {group.name} ({group.fields.length})
            </Typography>
            {group.fields.map((field) => (
              <PaletteFieldButton
                key={field.key}
                label={field.displayName}
                icon={fieldTypeIcon(field.fieldType)}
                description={field.description}
                disabled={used.has(field.key.toLowerCase())}
                onClick={() => onAdd(field)}
              />
            ))}
          </Stack>
        ))}
        {!visibleGroups.length && (
          <Stack spacing={1} alignItems="center" sx={{ py: 3, textAlign: 'center' }}>
            <Iconify icon="mdi:magnify-close" width={28} sx={{ color: 'text.secondary' }} />
            <Typography variant="subtitle2">No matching fields</Typography>
            <Typography variant="caption" color="text.secondary">
              Try a different name or add a custom field.
            </Typography>
            {search && (
              <Button size="small" sx={{ minHeight: 44 }} onClick={() => setSearch('')}>
                Clear search
              </Button>
            )}
          </Stack>
        )}
      </Stack>
    </>
  );
}
