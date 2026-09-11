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

type Props = {
  fields: AdmissionFormSystemFieldMetadata[];
  onAdd: (field: AdmissionFormSystemFieldMetadata) => void;
};

export function StudentFieldPalette({ fields, onAdd }: Props) {
  const [search, setSearch] = useState('');
  const normalizedSearch = search.trim().toLowerCase();
  const filteredFields = fields.filter((field) =>
    `${field.displayName} ${field.key}`.toLowerCase().includes(normalizedSearch)
  );
  return (
    <>
      <Typography variant="caption" color="text.secondary">
        Connect answers to the student record.
      </Typography>
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
      <Stack spacing={0.75} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
        {filteredFields.map((field) => (
          <PaletteFieldButton
            key={field.key}
            label={field.displayName}
            icon={fieldTypeIcon(field.fieldType)}
            description={field.description}
            onClick={() => onAdd(field)}
          />
        ))}
        {!filteredFields.length && (
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
