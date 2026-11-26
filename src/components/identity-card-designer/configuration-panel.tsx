import { useId, useRef, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { Box, Tab, Stack, Alert, Button } from '@mui/material';

import { ElementLayers } from './layers';
import { PrintSettings } from './print-settings';
import { LayoutSettings } from './layout-settings';
import { ElementInspector } from './element-inspector';
import { validateIdentityCardLayout } from './geometry';
import { ImageLayerAction } from './editor/image-layer-action';

import type { IdentityCardConfigurationProps } from './types';

export function DesignerConfigurationPanel(
  props: IdentityCardConfigurationProps & { printPreviewOpen: boolean; onPrintPreviewToggle: () => void }
) {
  const id = useId();
  const scrollArea = useRef<HTMLElement>(null);
  const {
    tab,
    onTabChange,
    brandingContent,
    canPlaceSignature,
    configurationPanelSize,
    showConfigurationHints,
    borderStylesEnabled,
    disabled,
    elements,
    selectedId,
    selected,
    layout,
    fields,
    fieldPickerLabel,
    onSelect,
    onAdd,
    onElementChange,
    onDelete,
    side = 'front',
    onLayoutChange,
  } = props;
  useEffect(() => {
    if (tab === 'elements' && selectedId && scrollArea.current) scrollArea.current.scrollTop = 0;
  }, [tab, selectedId]);
  const errors = validateIdentityCardLayout(layout, fields);
  const wide = configurationPanelSize === 'wide';
  const tabs = [
    ...(brandingContent ? [{ value: 'school', label: 'School', icon: 'mdi:school-outline' }] : []),
    { value: 'layout', label: 'Layout', icon: 'mdi:page-layout-body' },
    { value: 'elements', label: 'Elements', icon: 'mdi:layers-outline' },
    { value: 'print', label: 'Print', icon: 'mdi:printer-outline' },
  ];
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
        gap: wide ? 1 : 0.5,
      }}
    >
      <CustomTabs
        value={tab}
        onChange={(_, value) => onTabChange(value)}
        guardUnsavedChanges={false}
        density="compact"
        variant={wide ? 'scrollable' : 'fullWidth'}
        scrollButtons={wide ? 'auto' : undefined}
        allowScrollButtonsMobile={wide}
        aria-label="Designer settings"
        slotProps={wide ? { tab: { px: 0.75 } } : undefined}
        sx={{
          flexShrink: 0,
          ...(wide
            ? { border: 1, borderColor: 'divider', borderRadius: 1 }
            : { '& .MuiTabs-scroller': { px: 0 } }),
        }}
      >
        {tabs.map((item) => (
          <Tab
            key={item.value}
            value={item.value}
            label={item.label}
            icon={wide ? <Iconify icon={item.icon} width={14} aria-hidden /> : undefined}
            iconPosition="start"
            disabled={disabled}
            id={`${id}-${item.value}`}
            aria-controls={`${id}-panel-${item.value}`}
            sx={wide ? { flexGrow: 1, minWidth: 'max-content' } : { minWidth: 0, px: 0.75 }}
          />
        ))}
      </CustomTabs>
      <Box
        key={tab}
        ref={scrollArea}
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
          pl: wide ? 0.5 : 0,
          pr: wide ? 1 : 0.5,
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
          {tab === 'school' && (
            <>
              {brandingContent}
              {canPlaceSignature && !elements.some((element) => element.type === 'signature') && (
                <Button variant="outlined" disabled={disabled} onClick={() => onAdd('signature')}>
                  Add signature to {side}
                </Button>
              )}
            </>
          )}
          {tab === 'layout' && <LayoutSettings {...props} />}
          {tab === 'elements' && (
            <>
              <ElementInspector
                element={selected}
                fields={fields}
                fieldPickerLabel={fieldPickerLabel}
                onChange={onElementChange}
                onDelete={onDelete}
                disabled={disabled}
                borderStylesEnabled={borderStylesEnabled}
                themeColor={layout.themeColor}
                showEmptySelectionHint={showConfigurationHints}
              />
              <ElementLayers
                elements={elements}
                selectedId={selectedId}
                onSelect={onSelect}
                onAdd={onAdd}
                disabled={disabled}
              />
              <ImageLayerAction
                element={selected}
                layout={layout}
                side={side}
                onLayoutChange={onLayoutChange}
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
