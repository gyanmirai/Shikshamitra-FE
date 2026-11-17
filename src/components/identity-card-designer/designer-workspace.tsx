import { Box } from '@mui/material';

import { StudioLayers } from './studio/studio-layers';
import { StudioCanvas } from './editor/studio-canvas';
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
  return (
    <Box
      sx={{
        display: 'grid',
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        gap: 1,
        gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1fr) 320px' },
        gridTemplateRows: { xs: 'minmax(150px,55%) minmax(128px,1fr)', md: 'minmax(0,1fr)' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: 0,
          minWidth: 0,
          gap: 1,
        }}
      >
        <StudioToolRail tool={tool} onToolChange={setTool} onAdd={add} disabled={disabled} />
        {layers && (
          <Box
            sx={{ display: { xs: 'none', lg: 'flex' }, width: 240, flexShrink: 0, minHeight: 0 }}
          >
            <StudioLayers layout={layout} side={side} controller={studio} disabled={disabled} />
          </Box>
        )}
        <StudioCanvas
          {...previewProps}
          controller={studio}
          zoom={zoom}
          onFitZoom={measureFit}
          tool={tool}
          guides={guides}
          snap={snap}
          safeInsetMm={props.printSettings.safeInsetMm}
          disabled={disabled}
        />
      </Box>
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
      />
    </Box>
  );
}
