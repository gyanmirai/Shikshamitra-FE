import { useState } from 'react';
import { Alert, Button } from '@mui/material';

import { PhotoEditorDialog } from '../photo-editor';

import type { IdentityCardLayout, IdentityCardElement } from '../types';

export function ImageLayerAction({
  element,
  layout,
  side,
  onLayoutChange,
  disabled,
}: {
  element?: IdentityCardElement;
  layout: IdentityCardLayout;
  side: 'front' | 'back';
  onLayoutChange: (layout: IdentityCardLayout) => void;
  disabled?: boolean;
}) {
  const [source, setSource] = useState<{ id: string; imageData: string } | null>(null);
  const [error, setError] = useState('');
  if (element?.type !== 'image' || !element.imageData) return null;
  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}
      <Button
        variant="outlined"
        color="inherit"
        size="small"
        disabled={disabled || element.locked}
        onClick={() => {
          setSource({ id: element.id, imageData: element.imageData! });
          setError('');
        }}
      >
        Edit image
      </Button>
      {source && (
        <PhotoEditorDialog
          open
          source={{ imageData: source.imageData, name: element.label ?? 'Image layer' }}
          onClose={() => setSource(null)}
          disabled={disabled}
          onApply={(imageData) => {
            const current = layout[side]?.elements.find((item) => item.id === source.id);
            if (!current || current.locked || current.imageData !== source.imageData) {
              setError('The image layer changed. Reopen the editor to continue.');
              setSource(null);
              return;
            }
            onLayoutChange({
              ...layout,
              [side]: {
                elements: layout[side]!.elements.map((item) =>
                  item.id === source.id ? { ...item, imageData } : item
                ),
              },
            });
            setSource(null);
          }}
        />
      )}
    </>
  );
}
