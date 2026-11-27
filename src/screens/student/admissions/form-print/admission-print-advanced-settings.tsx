import type { TabScrollButtonProps } from '@mui/material/TabScrollButton';

import { useId } from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { Tab, Box, Stack, IconButton } from '@mui/material';
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

function AdvancedTabScrollButton({
  direction,
  disabled,
  className,
  onClick,
}: TabScrollButtonProps) {
  const left = direction === 'left';
  return (
    <IconButton
      className={className}
      type="button"
      size="small"
      aria-label={left ? 'Scroll tabs left' : 'Scroll tabs right'}
      disabled={disabled}
      onClick={onClick}
      sx={{
        width: 36,
        flexShrink: 0,
        mx: 0.5,
        border: 1,
        borderRadius: 1,
        borderColor: 'divider',
        color: 'text.primary',
        '@media (any-pointer: coarse)': { width: 44 },
      }}
    >
      <Iconify icon={left ? 'solar:arrow-left-bold' : 'solar:arrow-right-bold'} width={18} />
    </IconButton>
  );
}

export function AdmissionPrintAdvancedSettings({
  settings,
  onChange,
  form,
  branding,
  onEditHeader,
  pageCount,
}: Pick<
  AdmissionPrintAdvancedTabProps,
  'settings' | 'onChange' | 'form' | 'branding' | 'onEditHeader' | 'pageCount'
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
          slots={{ scrollButtons: AdvancedTabScrollButton }}
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
          pageCount={pageCount}
          advanced={advanced}
          update={update}
          form={form}
          branding={branding}
        />
      </Box>
    </Stack>
  );
}
