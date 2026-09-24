import { it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { createRoomOption } from './roomOptions';
import { GroupedRoomSelector } from './GroupedRoomSelector';

const rooms = [
  createRoomOption({
    id: 'b106',
    roomName: 'B106',
    buildingName: 'Science Block',
    floorName: 'First Floor',
  }),
  createRoomOption({
    id: 'b005',
    roomName: 'B005',
    buildingName: 'Science Block',
    floorName: 'Ground Floor',
  }),
];

it('shows rooms as selectable options grouped by block and floor', () => {
  const onChange = vi.fn();

  render(
    <GroupedRoomSelector label="Select Room *" options={rooms} value={null} onChange={onChange} />
  );

  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Select Room *' }));

  expect(screen.getByText('Science Block › First Floor')).toBeVisible();
  expect(screen.getByText('Science Block › Ground Floor')).toBeVisible();
  fireEvent.click(screen.getByRole('option', { name: 'B106' }));
  expect(onChange).toHaveBeenCalledWith(rooms[0]);
});

it('exposes the selected room through the listbox selected state', () => {
  render(
    <GroupedRoomSelector
      label="Select Room *"
      options={rooms}
      value={rooms[0]}
      onChange={vi.fn()}
    />
  );

  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Select Room *' }));
  expect(screen.getByRole('option', { name: 'B106', selected: true })).toBeVisible();
});
