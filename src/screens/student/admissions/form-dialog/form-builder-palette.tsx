import type {
  AdmissionFormFieldType,
  AdmissionFormSystemFieldMetadata,
} from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Tab,
  Tabs,
  Stack,
  Button,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';

import { CUSTOM_FIELD_PRESETS } from './form-field-presets';
import { FIELD_TYPES, fieldTypeIcon } from './form-dialog-model';

import type { AdmissionFieldPreset } from './form-field-presets';

type Props = {
  systemFields: AdmissionFormSystemFieldMetadata[];
  targetLabel?: string;
  onAddField: (
    fieldType: AdmissionFormFieldType,
    systemBinding?: string,
    preset?: AdmissionFieldPreset
  ) => void;
};

export function FormBuilderPalette({ systemFields, targetLabel, onAddField }: Props) {
  const [activeTab, setActiveTab] = useState<'system' | 'custom'>('system');
  const [search, setSearch] = useState('');
  const normalizedSearch = search.trim().toLowerCase();
  const filteredFields = systemFields.filter((field) =>
    `${field.displayName} ${field.key}`.toLowerCase().includes(normalizedSearch)
  );

  return (
    <BuilderPanel
      title="Add fields"
      description={
        targetLabel
          ? `Fields will be added to “${targetLabel}”.`
          : 'Choose a saved student field or create a custom field.'
      }
    >
      <Tabs
        value={activeTab}
        onChange={(_, value: 'system' | 'custom') => setActiveTab(value)}
        variant="fullWidth"
        sx={{ minHeight: 40, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab value="system" label="Student fields" sx={{ minHeight: 40 }} />
        <Tab value="custom" label="Custom fields" sx={{ minHeight: 40 }} />
      </Tabs>

      {activeTab === 'system' ? (
        <Stack spacing={1} sx={{ flex: 1, minHeight: 0, pt: 1.5 }}>
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
          <Stack spacing={0.5} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
            {filteredFields.map((field) => (
              <Button
                key={field.key}
                size="small"
                variant="text"
                startIcon={<Iconify icon={fieldTypeIcon(field.fieldType)} />}
                onClick={() => onAddField(field.fieldType, field.key)}
                sx={{ minHeight: 48, justifyContent: 'flex-start', textAlign: 'left', px: 1 }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {field.displayName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {field.description || field.key}
                  </Typography>
                </Box>
              </Button>
            ))}
            {!filteredFields.length && (
              <Box sx={{ py: 4, px: 1, textAlign: 'center' }}>
                <Iconify
                  icon="mdi:magnify-close"
                  width={28}
                  sx={{ color: 'text.disabled', mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  No student fields match your search.
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
      ) : (
        <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0, pt: 1.5, pr: 0.5, overflowY: 'auto' }}>
          <Typography variant="overline" color="text.secondary">
            Common fields
          </Typography>
          <Stack spacing={0.75}>
            {CUSTOM_FIELD_PRESETS.map((preset) => (
              <Button
                key={preset.key}
                size="small"
                variant="outlined"
                startIcon={<Iconify icon={preset.icon} />}
                onClick={() => onAddField(preset.fieldType, undefined, preset)}
                sx={{ minHeight: 52, justifyContent: 'flex-start', textAlign: 'left', px: 1 }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {preset.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {preset.description}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Stack>
          <Typography variant="overline" color="text.secondary">
            Basic fields
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
            {FIELD_TYPES.map(([label, value]) => (
              <Button
                key={value}
                size="small"
                variant="outlined"
                startIcon={<Iconify icon={fieldTypeIcon(value)} />}
                onClick={() => onAddField(value)}
                sx={{ minHeight: 48, justifyContent: 'flex-start', px: 1 }}
              >
                {label}
              </Button>
            ))}
          </Box>
        </Stack>
      )}
    </BuilderPanel>
  );
}

function BuilderPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Stack sx={{ height: 1, minHeight: 0, p: 1.5, bgcolor: 'background.paper' }}>
      <Typography variant="subtitle1">{title}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
        {description}
      </Typography>
      {children}
    </Stack>
  );
}
