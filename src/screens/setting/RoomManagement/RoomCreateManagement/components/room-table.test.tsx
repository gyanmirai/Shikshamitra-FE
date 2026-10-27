import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { _api as iconifyApi } from '@iconify/react';
import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';
import { createRoomTestWrapper } from 'src/components/timetable/room-defaults-test-fixture';

import RoomTable from './roomTable';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
const room = {
  id: 'room-a',
  roomName: 'A101',
  capacity: 40,
  totalBenches: 20,
  buildingName: 'Main Building',
  floorName: 'First Floor',
  roomTypeName: 'Classroom',
  features: ['Projector', 'Whiteboard'],
};
const buildings = [
  {
    id: 'building-a',
    buildingName: 'Main Building',
    floors: [{ id: 'floor-a', floorName: 'First Floor' }],
  },
];
beforeEach(() => {
  iconifyApi.setFetch((...args) => fetch(...args));
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/institute-setup/buildings', () => HttpResponse.json(buildings)),
    http.get('*/api/app/room', ({ request }) => {
      const filtered = Boolean(new URL(request.url).searchParams.get('filter'));
      return HttpResponse.json({ items: filtered ? [] : [room], totalCount: filtered ? 0 : 1 });
    }),
    http.get('https://api.iconify.design/:collection', ({ request, params }) =>
      HttpResponse.json({
        prefix: String(params.collection).replace('.json', ''),
        icons: {},
        not_found: new URL(request.url).searchParams.get('icons')?.split(',') ?? [],
      })
    )
  );
});
function renderTable() {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  render(<RoomTable onEdit={onEdit} onDelete={onDelete} />, createRoomTestWrapper());
  return { onEdit, onDelete };
}

it('names the table and row actions, searches rendered room values, and clears no-results', async () => {
  const { onEdit, onDelete } = renderTable();
  const table = await screen.findByRole('table', { name: 'Rooms table' });
  fireEvent.click(await screen.findByRole('button', { name: 'Edit room A101' }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete room A101' }));
  expect(onEdit).toHaveBeenCalledWith(room);
  expect(onDelete).toHaveBeenCalledWith(
    room,
    expect.objectContaining({ maxResultCount: 25, skipCount: 0 })
  );
  fireEvent.change(screen.getByRole('textbox', { name: 'Search rooms' }), {
    target: { value: 'missing-room' },
  });
  expect(await within(table).findByText(/No results found for/)).toBeInTheDocument();
  fireEvent.click(within(table).getByRole('button', { name: 'Clear search' }));
  expect(await within(table).findByText('A101')).toBeInTheDocument();
});

it('distinguishes a filtered empty result and clears both building and floor context', async () => {
  const requests: URL[] = [];
  mswServer.use(
    http.get('*/api/app/room', ({ request }) => {
      const url = new URL(request.url);
      requests.push(url);
      return HttpResponse.json({ items: url.searchParams.has('buildingId') ? [] : [room] });
    })
  );
  renderTable();
  await screen.findByText('A101');
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Building' }));
  fireEvent.click(screen.getByRole('option', { name: 'Main Building' }));
  expect(await screen.findByText('No rooms match the selected filters')).toBeInTheDocument();
  expect(requests.at(-1)?.searchParams.get('buildingId')).toBe('building-a');
  fireEvent.click(within(screen.getByRole('table')).getByRole('button', { name: 'Clear filters' }));
  expect(await screen.findByText('A101')).toBeInTheDocument();
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: 'Floor' })).toHaveAttribute('aria-disabled', 'true')
  );
});

it('shows a room request error and retries without presenting a successful empty result', async () => {
  let attempts = 0;
  mswServer.use(
    http.get('*/api/app/room', () => {
      attempts += 1;
      return attempts === 1
        ? HttpResponse.json({}, { status: 500 })
        : HttpResponse.json({ items: [room] });
    })
  );
  renderTable();
  const alert = await screen.findByRole('alert');
  expect(within(alert).getByText('Rooms could not be loaded')).toBeInTheDocument();
  expect(screen.queryByText('No rooms have been added yet')).not.toBeInTheDocument();
  fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('A101')).toBeInTheDocument();
  expect(attempts).toBe(2);
});

it('retains the room list when building filters fail and recovers their controls on retry', async () => {
  let attempts = 0;
  mswServer.use(
    http.get('*/api/institute-setup/buildings', () => {
      attempts += 1;
      return attempts === 1 ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(buildings);
    })
  );
  renderTable();
  await screen.findByText('A101');
  const alert = await screen.findByRole('alert');
  expect(screen.getByRole('combobox', { name: 'Building' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: 'Building' })).not.toHaveAttribute('aria-disabled')
  );
  expect(screen.getByText('A101')).toBeInTheDocument();
});

it('sends shared-table pagination, numeric column filters and sorting to the server', async () => {
  const requests: URL[] = [];
  mswServer.use(
    http.get('*/api/app/room', ({ request }) => {
      requests.push(new URL(request.url));
      return HttpResponse.json({ items: [room], totalCount: 1201 });
    })
  );
  renderTable();
  await screen.findByText('A101');
  fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
  await waitFor(() => expect(requests.at(-1)?.searchParams.get('skipCount')).toBe('25'));
  fireEvent.click(screen.getByRole('button', { name: 'Filter Capacity' }));
  const filter = screen.getByRole('dialog', { name: 'Filter Capacity' });
  fireEvent.mouseDown(within(filter).getByRole('combobox', { name: /Filter Type/ }));
  fireEvent.click(screen.getByRole('option', { name: 'Greater Than' }));
  fireEvent.change(within(filter).getByLabelText(/^Capacity/), { target: { value: '20' } });
  fireEvent.click(within(filter).getByRole('button', { name: 'Apply' }));
  await waitFor(() =>
    expect(JSON.parse(requests.at(-1)?.searchParams.get('columnFilters') ?? '[]')).toEqual([
      { column: 'capacity', type: 'greaterThan', value: 20 },
    ])
  );
  expect(requests.at(-1)?.searchParams.get('skipCount')).toBe('0');
  fireEvent.click(screen.getByRole('button', { name: 'Sort by Capacity' }));
  await waitFor(() => expect(requests.at(-1)?.searchParams.get('sorting')).toBe('capacity asc'));
});
