'use client';

import { Box, Alert } from '@mui/material';
import { useRef, useState, useEffect } from 'react';

import './editor/studio-icons';
import { PhotoEditorDialog } from './photo-editor';
import { newIdentityCardElement } from './new-element';
import { readStudioImage } from './editor/image-import';
import { useCardStudio } from './studio/use-card-studio';
import { DesignerWorkspace } from './designer-workspace';
import { useStudioView } from './editor/use-studio-view';
import { useStudioPhoto } from './editor/use-studio-photo';
import { canvasShortcuts } from './editor/canvas-shortcuts';
import { StudioCommandBar } from './editor/studio-command-bar';

import type { IdentityCardElement, IdentityCardDesignerProps } from './types';

export function IdentityCardDesigner(props: IdentityCardDesignerProps) {
  const { layout, onLayoutChange, backSideEnabled, disabled, brandingContent, values, photoUrl } =
    props;
  const view = useStudioView(backSideEnabled, brandingContent);
  const { side, tab, setTab, guides, setGuides, snap, tool, setTool, zoom, layers, measureFit } =
    view;
  const [imageError, setImageError] = useState('');
  const upload = useRef<HTMLInputElement>(null);
  const studio = useCardStudio({ layout, side, onLayoutChange, disabled });
  const photo = useStudioPhoto(props);
  const latest = useRef({ layout, side, disabled });
  latest.current = { layout, side, disabled };
  useEffect(
    () => () => {
      latest.current.disabled = true;
    },
    []
  );
  const elements = layout[side]?.elements ?? [];
  const selected = studio.selectedElements[0];
  useEffect(() => {
    if (selected?.id) setTab('elements');
  }, [selected?.id, setTab]);
  function updateElement(next: IdentityCardElement) {
    studio.commit({
      ...layout,
      [side]: { elements: elements.map((e) => (e.id === next.id ? next : e)) },
    });
  }
  function add(type: IdentityCardElement['type'], ellipse = false, imageData?: string) {
    if (disabled) return;
    if (type === 'image' && !imageData) {
      upload.current?.click();
      return;
    }
    const element = newIdentityCardElement(
      type,
      `${type}-${crypto.randomUUID()}`,
      layout,
      elements
    );
    if (ellipse) element.style = { ...element.style, shape: 'ellipse' };
    if (imageData) element.imageData = imageData;
    studio.commit({ ...layout, [side]: { elements: [...elements, element] } });
    studio.setSelectedIds([element.id]);
    setTab('elements');
    setTool('select');
  }
  const previewProps = {
    ...props,
    side,
    values: photo.record?.values ?? values,
    photoUrl: photo.record ? (photo.edit?.imageData ?? photo.record.imageData) : photoUrl,
  };
  return (
    <Box
      onKeyDown={(event) => canvasShortcuts(event, studio, layout, setTool, disabled)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 1,
        minHeight: 0,
        minWidth: 0,
        gap: 1,
        overflow: 'hidden',
      }}
    >
      <StudioCommandBar view={view} studio={studio} photo={photo} props={props} />
      {(imageError || photo.error) && (
        <Alert
          severity="error"
          onClose={() => {
            setImageError('');
            photo.clearError();
          }}
        >
          {imageError || photo.error}
        </Alert>
      )}
      <DesignerWorkspace
        {...{
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
        }}
      />
      <input
        ref={upload}
        type="file"
        accept="image/png,image/jpeg"
        hidden
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file) return;
          const version = latest.current;
          try {
            const data = await readStudioImage(file);
            if (
              latest.current.disabled ||
              version.layout !== latest.current.layout ||
              version.side !== latest.current.side
            )
              throw new Error('The card changed during import. Please upload the image again.');
            add('image', false, data);
            setImageError('');
          } catch (error) {
            setImageError(error instanceof Error ? error.message : 'Image import failed.');
          }
        }}
      />
      {photo.source && photo.sourceImage && (
        <PhotoEditorDialog
          open
          source={{ imageData: photo.sourceImage, name: photo.record?.name ?? 'Cardholder' }}
          onClose={photo.close}
          onApply={photo.apply}
          disabled={disabled}
        />
      )}
    </Box>
  );
}
