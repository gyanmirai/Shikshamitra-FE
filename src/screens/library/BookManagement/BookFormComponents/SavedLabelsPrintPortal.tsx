import { createPortal } from 'react-dom';
import { Box, GlobalStyles } from '@mui/material';

import { SavedLabelsGrid } from './SavedLabelsGrid';

import type { SavedLabel } from './saved-label-model';

export function SavedLabelsPrintPortal({
  enabled,
  labels,
  title,
  onValidityChange,
}: {
  enabled: boolean;
  labels: SavedLabel[];
  title?: string;
  onValidityChange: (key: string, valid: boolean) => void;
}) {
  if (!enabled || typeof document === 'undefined') return null;
  return createPortal(
    <>
      <GlobalStyles
        styles={{
          '@media print': {
            '@page': { size: 'A4', margin: '10mm' },
            'html, body': {
              height: 'auto !important',
              minHeight: '0 !important',
              overflow: 'visible !important',
              display: 'block !important',
              margin: '0 !important',
              padding: '0 !important',
              backgroundColor: '#fff !important',
            },
            'body > *:not(#library-saved-copy-print-root)': { display: 'none !important' },
            '#library-saved-copy-print-root': {
              display: 'block !important',
              position: 'static',
              width: '190mm',
              maxWidth: '100%',
              color: '#000',
              backgroundColor: '#fff',
              printColorAdjust: 'exact',
              WebkitPrintColorAdjust: 'exact',
            },
          },
        }}
      />
      <Box id="library-saved-copy-print-root" sx={{ display: 'none' }}>
        <SavedLabelsGrid labels={labels} title={title} onValidityChange={onValidityChange} />
      </Box>
    </>,
    document.body
  );
}
