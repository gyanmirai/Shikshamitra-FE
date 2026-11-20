import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';

import { StudioLayerRow } from './studio-layer-row';

import type { IdentityCardLayout } from '../types';
import type { StudioController } from './use-card-studio';

export type StudioLayersProps = {
  layout: IdentityCardLayout;
  side: 'front' | 'back';
  controller: StudioController;
  disabled?: boolean;
};

export function StudioLayers({ layout, side, controller, disabled }: StudioLayersProps) {
  const elements = [...(layout[side]?.elements ?? [])].sort((a, b) => b.z - a.z);
  return (
    <Box
      component="section"
      aria-label="Card layers"
      sx={{ minHeight: 0, width: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <Typography variant="subtitle2" sx={{ p: 1 }}>
        Layers
      </Typography>
      {elements.length ? (
        <List
          dense
          disablePadding
          aria-label={`${side === 'front' ? 'Front' : 'Back'} layers`}
          sx={{ minHeight: 0, maxHeight: 'none', overflowY: 'auto', flex: 1 }}
        >
          {elements.map((element) => (
            <StudioLayerRow
              key={element.id}
              element={element}
              controller={controller}
              disabled={disabled}
            />
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
          Add an element to this side.
        </Typography>
      )}
    </Box>
  );
}
