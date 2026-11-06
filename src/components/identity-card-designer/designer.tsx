'use client';

import { useState } from 'react';
import { Box } from '@mui/material';

import { DesignerPreviewPanel } from './preview-panel';
import { newIdentityCardElement } from './new-element';
import { DesignerConfigurationPanel } from './configuration-panel';

import type { IdentityCardElement, IdentityCardDesignerProps } from './types';

export function IdentityCardDesigner(props: IdentityCardDesignerProps) {
  const { layout, onLayoutChange, backSideEnabled, disabled, brandingContent } = props;
  const [requestedSide, setSide] = useState<'front' | 'back'>('front');
  const side = backSideEnabled ? requestedSide : 'front';
  const [tab, setTab] = useState(brandingContent ? 'school' : 'layout');
  const [guides, setGuides] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const elements = layout[side]?.elements ?? [];
  const selected = elements.find((element) => element.id === selectedId);
  const updateElements = (next: IdentityCardElement[]) => {
    if (!disabled) onLayoutChange({ ...layout, [side]: { ...layout[side], elements: next } });
  };
  const updateElement = (next: IdentityCardElement) =>
    updateElements(elements.map((element) => (element.id === next.id ? next : element)));
  const select = (elementId: string) => {
    setSelectedId(elementId);
    setTab('elements');
  };
  const add = (type: IdentityCardElement['type']) => {
    const elementId = `${type}-${globalThis.crypto.randomUUID()}`;
    updateElements([...elements, newIdentityCardElement(type, elementId, layout, elements)]);
    setSelectedId(elementId);
  };
  return (
    <Box
      sx={{
        display: 'grid',
        width: 1,
        height: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
        gap: 2,
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(320px, 420px)' },
        gridTemplateRows: { xs: 'minmax(170px, 44%) minmax(0, 1fr)', md: 'minmax(0, 1fr)' },
      }}
    >
      <DesignerPreviewPanel
        {...props}
        side={side}
        selectedId={selectedId}
        guides={guides}
        onSideChange={(next) => {
          setSide(next);
          setSelectedId('');
        }}
        onSelect={select}
        onMove={updateElement}
      />
      <DesignerConfigurationPanel
        {...props}
        tab={tab}
        onTabChange={setTab}
        guides={guides}
        onGuidesChange={setGuides}
        elements={elements}
        selected={selected}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAdd={add}
        onElementChange={updateElement}
        onDelete={() => {
          updateElements(elements.filter((element) => element.id !== selectedId));
          setSelectedId('');
        }}
      />
    </Box>
  );
}
