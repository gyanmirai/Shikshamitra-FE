import type {
  AdmissionFormFieldType,
  AdmissionFormSystemFieldMetadata,
} from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useId, useState } from 'react';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

import { CustomFieldPalette } from './components/custom-field-palette';
import { StudentFieldPalette } from './components/student-field-palette';

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
  const tabId = useId();
  const [activeTab, setActiveTab] = useState<'system' | 'custom'>('system');
  return (
    <Stack sx={{ height: 1, minHeight: 0, p: 1.5, bgcolor: 'background.paper' }}>
      <Typography variant="subtitle1">Add fields</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
        Click a field to add it to your form.
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          p: 1,
          mb: 1.5,
          bgcolor: 'action.selected',
          borderRadius: 1,
        }}
      >
        <Iconify icon="mdi:arrow-right-circle-outline" sx={{ color: 'primary.main' }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            Adding to section
          </Typography>
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            {targetLabel || 'Student Details'}
          </Typography>
        </Box>
      </Stack>
      <Tabs
        value={activeTab}
        variant="fullWidth"
        aria-label="Field library"
        onChange={(_, value: 'system' | 'custom') => setActiveTab(value)}
        sx={{ minHeight: 44, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          value="system"
          label="Student fields"
          id={`${tabId}-system`}
          aria-controls={`${tabId}-panel-system`}
          sx={{ minHeight: 44 }}
        />
        <Tab
          value="custom"
          label="Custom fields"
          id={`${tabId}-custom`}
          aria-controls={`${tabId}-panel-custom`}
          sx={{ minHeight: 44 }}
        />
      </Tabs>
      {(['system', 'custom'] as const).map((tab) => (
        <Stack
          key={tab}
          role="tabpanel"
          id={`${tabId}-panel-${tab}`}
          aria-labelledby={`${tabId}-${tab}`}
          spacing={1.25}
          sx={{ display: activeTab === tab ? 'flex' : 'none', flex: 1, minHeight: 0, pt: 1.5 }}
        >
          {tab === 'system' ? (
            <StudentFieldPalette
              fields={systemFields}
              onAdd={(field) => onAddField(field.fieldType, field.key)}
            />
          ) : (
            <CustomFieldPalette onAddField={onAddField} />
          )}
        </Stack>
      ))}
    </Stack>
  );
}
