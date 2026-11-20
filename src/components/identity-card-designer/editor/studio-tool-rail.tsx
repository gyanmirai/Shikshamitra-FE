import { Iconify } from 'src/components/iconify';
import { Box, Tooltip, IconButton } from '@mui/material';

import type { IdentityCardElement } from '../types';

const tools: {
  type: IdentityCardElement['type'];
  label: string;
  icon: string;
  ellipse?: boolean;
}[] = [
  { type: 'text', label: 'Add text', icon: 'mdi:format-text' },
  { type: 'photo', label: 'Add cardholder photo', icon: 'mdi:account-box-outline' },
  { type: 'logo', label: 'Add school logo', icon: 'mdi:domain' },
  { type: 'image', label: 'Upload image', icon: 'mdi:image-plus' },
  { type: 'shape', label: 'Add rectangle', icon: 'mdi:rectangle-outline' },
  { type: 'shape', label: 'Add ellipse', icon: 'mdi:circle-outline', ellipse: true },
  { type: 'line', label: 'Add line', icon: 'mdi:minus' },
  { type: 'qr', label: 'Add QR code', icon: 'mdi:qrcode' },
  { type: 'barcode', label: 'Add barcode', icon: 'mdi:barcode' },
];

const toolSize = {
  width: { xs: 44, md: 36 },
  height: { xs: 44, md: 36 },
  '@media (any-pointer: coarse)': { width: 44, height: 44 },
};

export function StudioToolRail({
  tool,
  onToolChange,
  onAdd,
  disabled,
}: {
  tool: 'select' | 'hand';
  onToolChange: (tool: 'select' | 'hand') => void;
  onAdd: (type: IdentityCardElement['type'], ellipse?: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Box
      role="toolbar"
      aria-label="Drawing tools"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'row', md: 'column' },
        overflow: 'auto',
        maxWidth: 1,
        minHeight: 0,
        flexShrink: 0,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 0.25,
      }}
    >
      {(
        [
          { key: 'select', label: 'Select (V)', icon: 'mdi:cursor-default-outline' },
          { key: 'hand', label: 'Pan (H or hold Space)', icon: 'mdi:hand-back-right-outline' },
        ] as const
      ).map((item) => (
        <Tooltip key={item.key} title={item.label}>
          <span>
            <IconButton
              aria-label={item.label}
              aria-pressed={tool === item.key}
              disabled={disabled}
              onClick={() => onToolChange(item.key)}
              sx={{
                ...toolSize,
                color: tool === item.key ? 'primary.main' : 'text.secondary',
                bgcolor: tool === item.key ? 'action.selected' : undefined,
              }}
            >
              <Iconify icon={item.icon} />
            </IconButton>
          </span>
        </Tooltip>
      ))}
      {tools.map((item) => (
        <Tooltip key={item.label} title={item.label}>
          <span>
            <IconButton
              aria-label={item.label}
              disabled={disabled}
              onClick={() => onAdd(item.type, item.ellipse)}
              sx={toolSize}
            >
              <Iconify icon={item.icon} />
            </IconButton>
          </span>
        </Tooltip>
      ))}
    </Box>
  );
}
