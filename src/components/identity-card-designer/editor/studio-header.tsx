import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { Tab, Box, Button, Typography } from '@mui/material';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';

import { DesignerSwitch } from '../controls';
import { StudioCardholderTools } from './studio-cardholder-tools';

import type { useStudioView } from './use-studio-view';
import type { IdentityCardPhotoRecord } from '../types';
import type { useStudioPhoto } from './use-studio-photo';

export function StudioHeader({
  widthMm,
  heightMm,
  view,
  backSideEnabled,
  layersId,
  configurationId,
  photo,
  photoRecords = [],
  disabled,
}: {
  widthMm: number;
  heightMm: number;
  view: ReturnType<typeof useStudioView>;
  backSideEnabled: boolean;
  layersId: string;
  configurationId: string;
  photo: ReturnType<typeof useStudioPhoto>;
  photoRecords?: IdentityCardPhotoRecord[];
  disabled?: boolean;
}) {
  const {
    side,
    setSide,
    guides,
    setGuides,
    snap,
    setSnap,
    layers,
    setLayers,
    configuration,
    setConfiguration,
  } = view;
  const dimensions = `${widthMm} × ${heightMm} mm`;
  return (
    <>
      <CustomTabs
        value={side}
        onChange={(_, value) => setSide(value)}
        guardUnsavedChanges={false}
        density="compact"
        variant="standard"
        aria-label="Card side"
        slotProps={{ scroller: { px: 0 }, tab: { px: 1 } }}
      >
        <Tab value="front" label="Front" />
        <Tab value="back" label="Back" disabled={!backSideEnabled} />
      </CustomTabs>
      <Box sx={{ display: 'flex', alignItems: 'center', '& label': { m: 0, mr: 0.5 } }}>
        <DesignerSwitch label="Guides" checked={guides} onChange={setGuides} disabled={disabled} />
        <DesignerSwitch label="Snap" checked={snap} onChange={setSnap} disabled={disabled} />
      </Box>
      <Button
        size="small"
        variant={layers ? 'outlined' : 'text'}
        aria-expanded={layers}
        aria-controls={layersId}
        onClick={() => setLayers(!layers)}
        startIcon={<Iconify icon={layers ? 'mdi:chevron-left' : 'mdi:chevron-right'} width={16} />}
      >
        Layers
      </Button>
      <Button
        size="small"
        variant={configuration ? 'outlined' : 'text'}
        aria-expanded={configuration}
        aria-controls={configurationId}
        onClick={() => setConfiguration(!configuration)}
        endIcon={<Iconify icon={configuration ? 'mdi:chevron-right' : 'mdi:chevron-left'} width={16} />}
      >
        Configuration
      </Button>
      {photoRecords.length > 0 && (
        <StudioCardholderTools photo={photo} records={photoRecords} disabled={disabled} />
      )}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <InfoTooltipIcon
          label="Designer keyboard shortcuts"
          title={`Select V · Pan H or hold Space · Shift-click selects multiple layers · Drag to select an area · Arrows move, Shift moves 10 units · Ctrl/Cmd Z undo, Shift Z redo · C/V copy/paste · D duplicate · G group, Shift G ungroup · Delete or Backspace removes unlocked layers. Printed size is ${dimensions}. Canvas zoom does not change printed size.`}
        />
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: 'none', xl: 'block' } }}
      >
        {dimensions}
      </Typography>
    </>
  );
}
