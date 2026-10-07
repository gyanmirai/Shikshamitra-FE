import type {
  AdmissionFormFieldType,
  AdmissionFormSystemFieldMetadata,
} from 'src/redux/student/admissions/admission-forms-api';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useId, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CustomFieldPalette } from './components/custom-field-palette';
import { StudentFieldPalette } from './components/student-field-palette';

import type { AdmissionFieldPreset } from './form-field-presets';

type Props = {
  systemFields: AdmissionFormSystemFieldMetadata[];
  usedBindings?: readonly string[];
  targetLabel?: string;
  loading?: boolean;
  error?: boolean;
  onAddField: (
    fieldType: AdmissionFormFieldType,
    systemBinding?: string,
    preset?: AdmissionFieldPreset
  ) => void;
  onAddGroupSection?: (name: string, fields: AdmissionFormSystemFieldMetadata[]) => void;
};

export function FormBuilderPalette({
  systemFields,
  usedBindings,
  targetLabel,
  loading,
  error,
  onAddField,
  onAddGroupSection,
}: Props) {
  const tabId = useId();
  const [activeTab, setActiveTab] = useState<'system' | 'custom'>('system');
  return (
    <Stack sx={{ height: 1, minHeight: 0, p: 1.5, bgcolor: 'background.paper' }}>
      
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
          spacing={0.75}
          sx={{ display: activeTab === tab ? 'flex' : 'none', flex: 1, minHeight: 0, pt: 1 }}
        >
          {tab === 'system' ? (
            <StudentFieldPalette
              fields={systemFields}
              usedBindings={usedBindings}
              loading={loading}
              error={error}
              onAdd={(field) => onAddField(field.fieldType, field.key)}
              onAddSection={onAddGroupSection}
            />
          ) : (
            <CustomFieldPalette
              onAddField={onAddField}
              systemFields={systemFields}
              usedBindings={usedBindings}
            />
          )}
        </Stack>
      ))}
    </Stack>
  );
}
