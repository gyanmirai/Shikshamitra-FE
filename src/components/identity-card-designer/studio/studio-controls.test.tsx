import { useState } from 'react';
import { it, vi, expect } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { layout } from './fixtures.test-utils';
import { StudioLayers } from './studio-layers';
import { StudioToolbar } from './studio-toolbar';
import { useCardStudio } from './use-card-studio';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

function Fixture({ disabled = false }: { disabled?: boolean }) {
  const [value, setValue] = useState(layout());
  const [zoom, setZoom] = useState(1);
  const controller = useCardStudio({
    layout: value,
    side: 'front',
    onLayoutChange: setValue,
    disabled,
  });
  return (
    <>
      <StudioToolbar
        controller={controller}
        zoom={zoom}
        onZoomChange={setZoom}
        onFit={vi.fn()}
        disabled={disabled}
      />
      <StudioLayers layout={value} side="front" controller={controller} disabled={disabled} />
    </>
  );
}

it('selects multiple layers and exposes a single undo transaction for grouping', () => {
  render(<Fixture />);
  expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Paste' })).toBeDisabled();
  const rows = screen.getAllByRole('button', { name: /^Select / });
  fireEvent.click(rows[0]);
  fireEvent.click(rows[1], { shiftKey: true });
  fireEvent.click(screen.getByRole('button', { name: 'Group selection' }));
  expect(screen.getByRole('button', { name: 'Ungroup selection' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
  expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
});

it('renames and locks a layer while keeping lock and visibility actions separate from selection', () => {
  render(<Fixture />);
  fireEvent.click(screen.getAllByRole('button', { name: /^Rename / })[0]);
  fireEvent.change(screen.getByRole('textbox', { name: 'Layer name' }), {
    target: { value: 'School title' },
  });
  fireEvent.keyDown(screen.getByRole('textbox', { name: 'Layer name' }), { key: 'Enter' });
  expect(screen.getByRole('button', { name: 'Select School title' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Lock School title' }));
  expect(screen.getByRole('button', { name: 'Rename School title' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Hide School title' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Unlock School title' }));
  fireEvent.click(screen.getByRole('button', { name: 'Hide School title' }));
  expect(screen.getByRole('button', { name: 'Show School title' })).toBeInTheDocument();
});

it('opens alignment commands and blocks mutations in disabled mode', () => {
  render(<Fixture disabled />);
  const toolbar = screen.getByRole('toolbar', { name: 'Card editing tools' });
  expect(within(toolbar).getByRole('button', { name: 'Align selection' })).toBeDisabled();
  expect(screen.getAllByRole('button', { name: /^Lock / })[0]).toBeDisabled();
});

it('provides alignment and layer-order menus and enables paste after copying', () => {
  render(<Fixture />);
  fireEvent.click(screen.getAllByRole('button', { name: /^Select / })[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
  expect(screen.getByRole('button', { name: 'Paste' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Align selection' }));
  expect(screen.getByRole('menuitem', { name: 'Distribute horizontally' })).toHaveAttribute('aria-disabled', 'true');
  fireEvent.click(screen.getByRole('menuitem', { name: 'Align left' }));
  fireEvent.click(screen.getByRole('button', { name: 'Order selection' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Send to back' }));
  expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled();
});

it('shift-clicking a selected group deselects the entire group', () => {
  render(<Fixture />);
  const rows = screen.getAllByRole('button', { name: /^Select / });
  fireEvent.click(rows[0]);
  fireEvent.click(rows[1], { shiftKey: true });
  fireEvent.click(screen.getByRole('button', { name: 'Group selection' }));
  fireEvent.click(rows[0], { shiftKey: true });
  expect(screen.getAllByRole('button', { name: /^Select / }).filter((row) => row.getAttribute('aria-pressed') === 'true')).toHaveLength(0);
});
