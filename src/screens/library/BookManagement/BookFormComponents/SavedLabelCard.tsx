import type { ComponentProps } from 'react';

import Barcode from 'react-barcode';
import { Box, Stack, Typography } from '@mui/material';

import { savedLabelValidationKey } from './saved-label-model';

import type { SavedLabel } from './saved-label-model';

export type { SavedLabel } from './saved-label-model';
type BarcodeWithValidity = ComponentProps<typeof Barcode> & { valid: (isValid: boolean) => void };

export function SavedLabelCard({
  label,
  title,
  onValidityChange,
}: {
  label: SavedLabel;
  title?: string;
  onValidityChange: (accession: string, valid: boolean) => void;
}) {
  const barcode: BarcodeWithValidity = {
    value: label.barcodeValue,
    format: 'CODE128',
    width: 1.2,
    height: 48,
    margin: 12,
    displayValue: false,
    valid: (valid) => onValidityChange(savedLabelValidationKey(label), valid),
  };
  return (
    <Stack
      spacing={0.5}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 1.5,
        alignItems: 'center',
        breakInside: 'avoid',
        minWidth: 0,
        overflow: 'hidden',
        '@media print': {
          overflow: 'visible',
          borderColor: '#000',
          color: '#000',
          backgroundColor: '#fff',
        },
      }}
    >
      <Typography variant="body2" dir="auto" sx={{ overflowWrap: 'anywhere' }}>
        {title}
      </Typography>
      <Box sx={{ maxWidth: '100%', '& svg': { maxWidth: '100%', height: 'auto' } }}>
        <Barcode {...barcode} />
      </Box>
      <Typography variant="caption" dir="auto" sx={{ overflowWrap: 'anywhere' }}>
        {label.accessionNumber}
      </Typography>
      <Typography variant="caption">
        Copy {label.copyNumber} · {label.sectionName} / {label.shelfName}
      </Typography>
    </Stack>
  );
}
