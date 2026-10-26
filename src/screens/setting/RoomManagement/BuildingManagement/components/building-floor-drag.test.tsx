import { addIcon } from '@iconify/react';
import { GlobalIcons } from 'src/utils/icons';
import { useFormik, FormikProvider } from 'formik';
import { it, vi, expect, afterEach } from 'vitest';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { act, screen, render, waitFor, fireEvent } from '@testing-library/react';

import { BuildingFloorsSection } from './building-floors-section';

import type { IBuildingFormValues } from '../types';

Object.values(GlobalIcons).forEach((icon) => addIcon(icon, { body: '<path />' }));

const initialValues: IBuildingFormValues = {
  buildingName: 'North',
  description: '',
  floors: [
    { id: 'floor-a', rowKey: 'floor-a', floorNo: 1, floorName: 'Ground', totalRoom: 5 },
    { id: 'floor-b', rowKey: 'floor-b', floorNo: 2, floorName: 'First', totalRoom: 8 },
  ],
};

function FloorHarness({ onSubmit }: { onSubmit: (values: IBuildingFormValues) => void }) {
  const formik = useFormik({ initialValues, onSubmit });
  return (
    <ThemeProvider theme={createTheme()}>
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <BuildingFloorsSection formik={formik} />
          <button type="submit">Save floors</button>
        </form>
      </FormikProvider>
    </ThemeProvider>
  );
}

function mockRowGeometry() {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect(
    this: Element
  ) {
    const row = this.closest('[role="listitem"]');
    const index = row ? [...document.querySelectorAll('[role="listitem"]')].indexOf(row) : 0;
    const top = index * 160;
    return {
      x: 0,
      y: top,
      top,
      left: 0,
      right: 500,
      bottom: top + 150,
      width: 500,
      height: 150,
      toJSON: () => ({}),
    };
  });
}

afterEach(() => vi.restoreAllMocks());

it('reorders with the drag handle keyboard sensor while preserving persisted IDs and room counts', async () => {
  mockRowGeometry();
  const onSubmit = vi.fn();
  render(<FloorHarness onSubmit={onSubmit} />);
  const handle = screen.getByRole('button', { name: 'Drag floor 1 to reorder' });
  act(() => handle.focus());
  fireEvent.keyDown(handle, { code: 'Space', key: ' ' });
  await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'true'));
  fireEvent.keyDown(document, { code: 'ArrowDown', key: 'ArrowDown' });
  await screen.findByText('Ground is at position 2.');
  fireEvent.keyDown(document, { code: 'Space', key: ' ' });
  await waitFor(() =>
    expect(
      screen
        .getAllByRole('textbox', { name: /Floor name/i })
        .map((field) => (field as HTMLInputElement).value)
    ).toEqual(['First', 'Ground'])
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save floors' }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  expect(onSubmit.mock.calls[0][0].floors).toEqual([
    initialValues.floors[1],
    initialValues.floors[0],
  ]);
});

it('cancels keyboard dragging without changing the floor order', async () => {
  mockRowGeometry();
  render(<FloorHarness onSubmit={vi.fn()} />);
  const handle = screen.getByRole('button', { name: 'Drag floor 1 to reorder' });
  act(() => handle.focus());
  fireEvent.keyDown(handle, { code: 'Space', key: ' ' });
  await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'true'));
  fireEvent.keyDown(document, { code: 'ArrowDown', key: 'ArrowDown' });
  await screen.findByText('Ground is at position 2.');
  fireEvent.keyDown(document, { code: 'Escape', key: 'Escape' });
  await screen.findByText('Ground was not moved.');
  expect(
    screen
      .getAllByRole('textbox', { name: /Floor name/i })
      .map((field) => (field as HTMLInputElement).value)
  ).toEqual(['Ground', 'First']);
});
