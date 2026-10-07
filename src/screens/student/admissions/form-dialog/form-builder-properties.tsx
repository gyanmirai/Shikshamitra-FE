import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useId, useState } from 'react';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { FormFieldCoreFields } from './form-field-core-fields';
import { FormFieldAdvancedFields } from './form-field-advanced-fields';
import { FormFieldLocationSettings } from './form-field-location-settings';
import { FieldPropertiesHeader } from './components/field-properties-header';
import { FieldGuidanceSettings } from './components/field-guidance-settings';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  selectedLocation: { sectionIndex: number; fieldIndex: number } | null;
};

export function FormBuilderProperties({ formik, selectedLocation }: Props) {
  const settingsId = useId();
  const [activeTab, setActiveTab] = useState<'basic' | 'rules'>('basic');
  const section = selectedLocation
    ? formik.values.sections[selectedLocation.sectionIndex]
    : undefined;
  const field = selectedLocation ? section?.fields[selectedLocation.fieldIndex] : undefined;
  if (!selectedLocation || !field) {
    return (
      <Stack sx={{ height: 1, p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle1">Field settings</Typography>
        <Stack
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{ flex: 1, py: 4, textAlign: 'center' }}
        >
          <Box sx={{ display: 'flex', p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 0.5 }}>
            <Iconify
              icon="mdi:cursor-default-click-outline"
              width={32}
              sx={{ color: 'text.secondary' }}
            />
          </Box>
          <Typography variant="subtitle2">Choose a field to customize</Typography>
          <Typography variant="body2" color="text.secondary">
            Select any field in your form to change its label, make it required, or add
            instructions.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            New fields are selected automatically.
          </Typography>
        </Stack>
      </Stack>
    );
  }
  const settingsProps = { formik, ...selectedLocation };
  return (
    <Stack sx={{ height: 1, minHeight: 0, bgcolor: 'background.paper' }}>
      <FieldPropertiesHeader field={field} sectionName={section?.name} />
      <Tabs
        value={activeTab}
        onChange={(_, value: 'basic' | 'rules') => setActiveTab(value)}
        variant="fullWidth"
        aria-label="Field settings categories"
        sx={{
          flexShrink: 0,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': { minHeight: 44 },
          '& .Mui-selected': { color: 'text.primary' },
          '& .MuiTabs-indicator': { bgcolor: 'common.black' },
        }}
      >
        <Tab
          value="basic"
          label="Basic"
          id={`${settingsId}-basic-tab`}
          aria-controls={`${settingsId}-basic-panel`}
        />
        <Tab
          value="rules"
          label="Rules"
          id={`${settingsId}-rules-tab`}
          aria-controls={`${settingsId}-rules-panel`}
        />
      </Tabs>
      <Scrollbar fillContent sx={{ flex: 1, minHeight: 0 }}>
        <Stack
          key={field.id}
          role="tabpanel"
          id={`${settingsId}-${activeTab}-panel`}
          aria-labelledby={`${settingsId}-${activeTab}-tab`}
          spacing={1.5}
          sx={{ p: 1.5, bgcolor: 'background.neutral' }}
        >
          {activeTab === 'basic' && (
            <>
              <FormFieldCoreFields {...settingsProps} />
              <SectionCard
                title="More options"
                paperProps={{ sx: { mb: 0, minWidth: 0 } }}
                gridProps={{ sx: { display: 'block' } }}
              >
                <FieldGuidanceSettings {...settingsProps} />
              </SectionCard>
            </>
          )}
          {activeTab === 'rules' && (
            <>
              <FormFieldLocationSettings {...settingsProps} />
              <FormFieldAdvancedFields {...settingsProps} />
            </>
          )}
        </Stack>
      </Scrollbar>
    </Stack>
  );
}
