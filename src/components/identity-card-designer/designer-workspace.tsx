import { useState } from 'react';
import { Box } from '@mui/material';

import { StudioLayers } from './studio/studio-layers';
import { StudioCanvas } from './editor/studio-canvas';
import { IdentityCardSheetPreview } from './sheet-preview';
import { StudioToolRail } from './editor/studio-tool-rail';
import { DesignerConfigurationPanel } from './configuration-panel';

import type { StudioController } from './studio/use-card-studio';
import type {
  IdentityCardElement,
  IdentityCardPreviewProps,
  IdentityCardDesignerProps,
} from './types';

export function DesignerWorkspace({
  props,
  side,
  tool,
  setTool,
  add,
  layers,
  layersId,
  configuration,
  configurationId,
  layout,
  studio,
  previewProps,
  zoom,
  measureFit,
  guides,
  snap,
  disabled,
  tab,
  setTab,
  setGuides,
  elements,
  selected,
  updateElement,
}: {
  props: IdentityCardDesignerProps;
  side: 'front' | 'back';
  tool: 'select' | 'hand';
  setTool: (tool: 'select' | 'hand') => void;
  add: (type: IdentityCardElement['type'], ellipse?: boolean) => void;
  layers: boolean;
  layersId: string;
  configuration: boolean;
  configurationId: string;
  layout: IdentityCardDesignerProps['layout'];
  studio: StudioController;
  previewProps: IdentityCardPreviewProps;
  zoom: number;
  measureFit: (value: number) => void;
  guides: boolean;
  snap: boolean;
  disabled?: boolean;
  tab: string;
  setTab: (tab: string) => void;
  setGuides: (value: boolean) => void;
  elements: IdentityCardElement[];
  selected?: IdentityCardElement;
  updateElement: (element: IdentityCardElement) => void;
}) {
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const showPrintPreview = configuration && tab === 'print' && printPreviewOpen;
  const layersArea = layers ? ' layers' : '';
  const configurationArea = configuration ? ' configuration' : '';
  const panelCount = Number(layers) + Number(configuration);
  return (
    <Box
      sx={{
        display: 'grid',
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        gap: 1,
        gridTemplateAreas: {
          xs: `"tools" "canvas"${layers ? ' "layers"' : ''}${configuration ? ' "configuration"' : ''}`,
          md: `"tools${layersArea} canvas${configurationArea}"`,
        },
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          md: `auto${layers ? ' clamp(12rem, 17vw, 15rem)' : ''} minmax(0, 1fr)${configuration ? ' clamp(17rem, 23vw, 20rem)' : ''}`,
        },
        gridTemplateRows: {
          xs: `auto minmax(0, 2fr)${panelCount ? ` repeat(${panelCount}, minmax(0, 1fr))` : ''}`,
          md: 'minmax(0, 1fr)',
        },
      }}
    >
      <Box sx={{ gridArea: 'tools', display: 'flex', minHeight: 0, minWidth: 0 }}>
        <StudioToolRail tool={tool} onToolChange={setTool} onAdd={add} disabled={disabled} />
      </Box>
      <Box
        id={layersId}
        hidden={!layers}
        sx={{ gridArea: 'layers', display: layers ? 'flex' : 'none', minHeight: 0, minWidth: 0 }}
      >
        {layers && (
          <StudioLayers layout={layout} side={side} controller={studio} disabled={disabled} />
        )}
      </Box>
      <Box sx={{ gridArea: 'canvas', display: 'flex', minHeight: 0, minWidth: 0 }}>
        {showPrintPreview ? (
          <Box
            role="region"
            aria-label="Print Preview"
            tabIndex={0}
            sx={{ width: 1, overflow: 'auto', p: 1.5, bgcolor: 'background.neutral' }}
          >
            <IdentityCardSheetPreview
              {...previewProps}
              settings={props.printSettings}
              backSideEnabled={props.backSideEnabled}
            />
          </Box>
        ) : <StudioCanvas
          {...previewProps}
          controller={studio}
          zoom={zoom}
          onFitZoom={measureFit}
          tool={tool}
          guides={guides}
          snap={snap}
          safeInsetMm={props.printSettings.safeInsetMm}
          disabled={disabled}
        />}
      </Box>
      <Box
        id={configurationId}
        hidden={!configuration}
        sx={{
          gridArea: 'configuration',
          display: configuration ? 'flex' : 'none',
          minHeight: 0,
          minWidth: 0,
        }}
      >
        <DesignerConfigurationPanel
          {...props}
          side={side}
          onLayoutChange={studio.commit}
          tab={tab}
          onTabChange={setTab}
          guides={guides}
          onGuidesChange={setGuides}
          elements={elements}
          selected={selected}
          selectedId={selected?.id ?? ''}
          onSelect={(id) => studio.setSelectedIds([id])}
          onAdd={add}
          onElementChange={updateElement}
          onDelete={studio.deleteSelection}
          printPreviewOpen={showPrintPreview}
          onPrintPreviewToggle={() => setPrintPreviewOpen((open) => !open)}
        />
      </Box>
    </Box>
  );
}
