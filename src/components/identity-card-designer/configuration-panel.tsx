import { useId } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Tab, Stack, Alert } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { FormSectionHeader } from 'src/components/form-section-card';

import { ElementLayers } from './layers';
import { PrintSettings } from './print-settings';
import { LayoutSettings } from './layout-settings';
import { ElementInspector } from './element-inspector';
import { validateIdentityCardLayout } from './geometry';

import type { IdentityCardConfigurationProps } from './types';

export function DesignerConfigurationPanel(props: IdentityCardConfigurationProps) {
  const id = useId();
  const {
    tab,
    onTabChange,
    brandingContent,
    disabled,
    elements,
    selectedId,
    selected,
    layout,
    fields,
    onSelect,
    onAdd,
    onElementChange,
    onDelete,
  } = props;
  const errors = validateIdentityCardLayout(layout, fields);
  const tabs = [
    ...(brandingContent ? [{ value: 'school', label: 'School', icon: GlobalIcons.building }] : []),
    { value: 'layout', label: 'Layout', icon: GlobalIcons.academicFieldSettings },
    { value: 'elements', label: 'Elements', icon: GlobalIcons.edit },
    { value: 'print', label: 'Print', icon: GlobalIcons.printer },
  ];
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
        gap: 1,
      }}
    >
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <FormSectionHeader
          title="Configuration"
          icon={GlobalIcons.academicFieldSettings}
          descriptionTooltip="School branding, layout, selected elements and print settings have separate tabs. Only this panel scrolls; edits appear on the fixed card preview."
        />
      </Box>
      <CustomTabs
        value={tab}
        onChange={(_, value) => onTabChange(value)}
        guardUnsavedChanges={false}
        variant="fullWidth"
        aria-label="Designer settings"
        sx={{ flexShrink: 0 }}
      >
        {tabs.map((item) => (
          <Tab
            key={item.value}
            value={item.value}
            label={item.label}
            disabled={disabled}
            icon={
              <Iconify icon={item.icon} width={18} sx={{ display: { xs: 'none', sm: 'block' } }} />
            }
            iconPosition="start"
            id={`${id}-${item.value}`}
            aria-controls={`${id}-panel-${item.value}`}
            sx={{ minWidth: 0, px: 1 }}
          />
        ))}
      </CustomTabs>
      <Box
        key={tab}
        component="section"
        role="region"
        aria-label="Card configuration"
        tabIndex={0}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          scrollbarGutter: 'stable',
          pr: 0.5,
          '&:focus-visible': { outline: '2px solid', outlineColor: 'info.main', outlineOffset: -2 },
        }}
      >
        <Stack
          role="tabpanel"
          id={`${id}-panel-${tab}`}
          aria-labelledby={`${id}-${tab}`}
          spacing={2}
          sx={{ pb: 1 }}
        >
          {errors.length > 0 && (
            <Alert severity="error">
              {errors.slice(0, 6).map((error) => (
                <Box key={error}>{error}</Box>
              ))}
              {errors.length > 6 && <Box>And {errors.length - 6} more layout errors.</Box>}
            </Alert>
          )}
          {tab === 'school' && brandingContent}
          {tab === 'layout' && <LayoutSettings {...props} />}
          {tab === 'elements' && (
            <>
              <ElementLayers
                elements={elements}
                selectedId={selectedId}
                onSelect={onSelect}
                onAdd={onAdd}
                disabled={disabled}
              />
              <ElementInspector
                element={selected}
                fields={fields}
                onChange={onElementChange}
                onDelete={onDelete}
                disabled={disabled}
              />
            </>
          )}
          {tab === 'print' && <PrintSettings {...props} />}
        </Stack>
      </Box>
    </Box>
  );
}
