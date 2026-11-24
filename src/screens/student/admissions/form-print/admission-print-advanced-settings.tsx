import { useId } from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { GlobalIcons } from 'src/utils/icons';
import { Tab, Box, Stack } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { resolveAdmissionPrintAdvancedSettings } from 'src/redux/student/admissions/admission-form-print-settings';

import { AdmissionPrintPaperStyleSettings } from './admission-print-paper-style-settings';
import { AdmissionPrintHeaderFooterSettings } from './admission-print-header-footer-settings';
import { AdmissionPrintContentCopiesSettings } from './admission-print-content-copies-settings';
import { AdmissionPrintSectionsFieldsSettings } from './admission-print-sections-fields-settings';

import type { AdmissionPrintAdvancedTabProps } from './admission-print-advanced-types';

const TABS = [
  { value: 'paper', label: 'Paper & style' },
  { value: 'header', label: 'Header & footer' },
  { value: 'sections', label: 'Sections & fields' },
  { value: 'content', label: 'Content & copies' },
] as const;
const TAB_ICONS = {
  paper: GlobalIcons.stationaryIcon,
  header: GlobalIcons.documentIcon,
  sections: GlobalIcons.academicFieldSettings,
  content: GlobalIcons.copy,
};
const PANELS = {
  paper: AdmissionPrintPaperStyleSettings,
  header: AdmissionPrintHeaderFooterSettings,
  sections: AdmissionPrintSectionsFieldsSettings,
  content: AdmissionPrintContentCopiesSettings,
};

export function AdmissionPrintAdvancedSettings({
  settings,
  onChange,
  form,
  branding,
  onEditHeader,
}: Pick<
  AdmissionPrintAdvancedTabProps,
  'settings' | 'onChange' | 'form' | 'branding' | 'onEditHeader'
>) {
  const id = useId();
  const tabs = useTabs(TABS[0].value);
  const tab = TABS.find((item) => item.value === tabs.value)?.value ?? TABS[0].value;
  const advanced = resolveAdmissionPrintAdvancedSettings(settings.advanced);
  const update: AdmissionPrintAdvancedTabProps['update'] = (group, patch) =>
    onChange({
      ...settings,
      advanced: { ...settings.advanced, [group]: { ...settings.advanced?.[group], ...patch } },
    });
  const Panel = PANELS[tab];
  return (
    <Stack spacing={1.5} sx={{ minWidth: 0 }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          minWidth: 0,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <CustomTabs
          density="compact"
          guardUnsavedChanges={false}
          value={tabs.value}
          onChange={tabs.onChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Advanced print settings"
        >
          {TABS.map((item) => (
            <Tab
              key={item.value}
              value={item.value}
              id={`${id}-tab-${item.value}`}
              aria-controls={`${id}-panel-${item.value}`}
              label={item.label}
              icon={<Iconify icon={TAB_ICONS[item.value]} width={20} />}
              iconPosition="start"
            />
          ))}
        </CustomTabs>
      </Box>
      <Box role="tabpanel" id={`${id}-panel-${tab}`} aria-labelledby={`${id}-tab-${tab}`}>
        <Panel
          settings={settings}
          onChange={onChange}
          onEditHeader={onEditHeader}
          advanced={advanced}
          update={update}
          form={form}
          branding={branding}
        />
      </Box>
    </Stack>
  );
}
