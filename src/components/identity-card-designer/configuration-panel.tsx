import { useId, useRef, useEffect } from 'react';
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
  const tabs = [
    ...(brandingContent ? [{ value: 'school', label: 'School' }] : []),
    { value: 'layout', label: 'Layout' },
    { value: 'elements', label: 'Elements' },
    { value: 'print', label: 'Print' },
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
        gap: 0.5,
      }}
    >
      <CustomTabs
        value={tab}
        onChange={(_, value) => onTabChange(value)}
        guardUnsavedChanges={false}
        density="compact"
        variant="fullWidth"
        aria-label="Designer settings"
        sx={{ flexShrink: 0, '& .MuiTabs-scroller': { px: 0 } }}
      >
        {tabs.map((item) => (
          <Tab
            key={item.value}
            value={item.value}
            label={item.label}
            disabled={disabled}
            id={`${id}-${item.value}`}
            aria-controls={`${id}-panel-${item.value}`}
            sx={{ minWidth: 0, px: 0.75 }}
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
