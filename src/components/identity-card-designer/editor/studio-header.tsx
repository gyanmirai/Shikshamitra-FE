import { Tab, Box, Typography } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';

import { DesignerSwitch } from '../controls';
import { StudioCardholderTools } from './studio-cardholder-tools';

import type { IdentityCardPhotoRecord } from '../types';
import type { useStudioPhoto } from './use-studio-photo';

export function StudioHeader({
  widthMm,
  heightMm,
  side,
  onSideChange,
  backSideEnabled,
  guides,
  onGuidesChange,
  snap,
  onSnapChange,
  layers,
  onLayersChange,
  photo,
  photoRecords = [],
  disabled,
}: {
  widthMm: number;
  heightMm: number;
  side: 'front' | 'back';
  onSideChange: (side: 'front' | 'back') => void;
  backSideEnabled: boolean;
  guides: boolean;
  onGuidesChange: (value: boolean) => void;
  snap: boolean;
  onSnapChange: (value: boolean) => void;
  layers: boolean;
  onLayersChange: (value: boolean) => void;
  photo: ReturnType<typeof useStudioPhoto>;
  photoRecords?: IdentityCardPhotoRecord[];
  disabled?: boolean;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', flexShrink: 0 }}>
      <CustomTabs
        value={side}
        onChange={(_, value) => onSideChange(value)}
        guardUnsavedChanges={false}
        aria-label="Card side"
      >
        <Tab value="front" label="Front" />
        <Tab value="back" label="Back" disabled={!backSideEnabled} />
      </CustomTabs>
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <DesignerSwitch label="Guides" checked={guides} onChange={onGuidesChange} />
      </Box>
      <DesignerSwitch label="Snap" checked={snap} onChange={onSnapChange} />
      <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
        <DesignerSwitch label="Layers" checked={layers} onChange={onLayersChange} />
      </Box>
      <Box sx={{ flex: 1 }} />
      {photoRecords.length > 0 && (
        <StudioCardholderTools photo={photo} records={photoRecords} disabled={disabled} />
      )}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <InfoTooltipIcon
          label="Designer keyboard shortcuts"
          title="Select V · Pan H or hold Space · Shift-click selects multiple layers · Drag to select an area · Arrows move, Shift moves 10 units · Ctrl/Cmd Z undo, Shift Z redo · C/V copy/paste · D duplicate · G group, Shift G ungroup · Delete removes unlocked layers. Canvas zoom does not change printed size."
        />
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: 'none', sm: 'block' } }}
      >
        {widthMm} × {heightMm} mm
      </Typography>
    </Box>
  );
}
