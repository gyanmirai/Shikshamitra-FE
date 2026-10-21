import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { DivisionRoomField } from './division-room-field';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const rooms = [
  { id: 'b101', roomName: 'B101', buildingName: 'Science Block', floorName: 'First Floor' },
  { id: 'a001', roomName: 'A001', buildingName: 'Main Block', floorName: 'Ground Floor' },
  { id: 'b102', roomName: 'B102', buildingName: 'Science Block', floorName: 'First Floor' },
];

function renderPicker(roomNumber?: string) {
  const onChange = vi.fn();
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  render(
    <Provider store={store}>
      <DivisionRoomField disabled={false} roomNumber={roomNumber} onChange={onChange} />
    </Provider>
  );
  const input = screen.getByRole('combobox', { name: 'Room (optional)' });
  fireEvent.focus(input);
  return { onChange, input };
}

it('groups interleaved results and selects and clears a stable room ID', async () => {
  mswServer.use(
    http.get('*/api/app/room', ({ request }) => {
      const filter = new URL(request.url).searchParams.get('filter') ?? '';
      return HttpResponse.json({ items: filter.includes('›') ? [] : rooms, totalCount: 3 });
    })
  );
  const { input, onChange } = renderPicker();
  fireEvent.mouseDown(input);
  expect(await screen.findByRole('option', { name: 'B101' })).toBeVisible();
  expect(screen.getAllByText('Science Block › First Floor')).toHaveLength(1);
  expect(screen.getByText('Main Block › Ground Floor')).toBeVisible();
  fireEvent.click(screen.getByRole('option', { name: 'B102' }));
  expect(onChange).toHaveBeenLastCalledWith('b102');
  expect(input).toHaveValue('Science Block › First Floor › B102');
  fireEvent.mouseDown(input);
  expect(await screen.findByRole('option', { name: 'B101' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
  expect(onChange).toHaveBeenLastCalledWith('');
});

it.each(['Science', 'First Floor', 'B101'])(
  'searches the server for %s and keeps matching groups',
  async (query) => {
    const queries: string[] = [];
    mswServer.use(
      http.get('*/api/app/room', ({ request }) => {
        const filter = new URL(request.url).searchParams.get('filter') ?? '';
        queries.push(filter);
        return HttpResponse.json({
          items: filter ? [rooms[0]] : rooms,
          totalCount: filter ? 1 : 3,
        });
      })
    );
    const { input } = renderPicker();
    fireEvent.mouseDown(input);
    await screen.findByRole('option', { name: 'A001' });
    fireEvent.change(input, { target: { value: query } });
    expect(await screen.findByRole('option', { name: 'B101' })).toBeVisible();
    await waitFor(() => expect(queries).toContain(query));
    expect(input).toHaveValue(query);
    expect(screen.queryByRole('option', { name: 'A001' })).not.toBeInTheDocument();
  }
);

it('preserves an edit assignment when search fails and retries without losing it', async () => {
  let fail = true;
  mswServer.use(
    http.get('*/api/app/room', () =>
      fail
        ? new HttpResponse(null, { status: 500 })
        : HttpResponse.json({ items: rooms, totalCount: 3 })
    )
  );
  const { input, onChange } = renderPicker('Legacy room');
  await screen.findByRole('alert');
  expect(input).toHaveValue('Legacy room');
  fireEvent.mouseDown(input);
  fail = false;
  fireEvent.click(await screen.findByRole('button', { name: 'Retry results' }));
  expect(await screen.findByRole('option', { name: 'B101' })).toBeVisible();
  expect(onChange).not.toHaveBeenCalled();
});

it('supports keyboard selection and Escape without changing the saved choice', async () => {
  mswServer.use(
    http.get('*/api/app/room', () => HttpResponse.json({ items: rooms, totalCount: 3 }))
  );
  const { input, onChange } = renderPicker();
  fireEvent.mouseDown(input);
  await screen.findByRole('option', { name: 'A001' });
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onChange).toHaveBeenLastCalledWith('a001');
  fireEvent.mouseDown(input);
  fireEvent.keyDown(input, { key: 'Escape' });
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  expect(onChange).toHaveBeenCalledTimes(1);
});

it('browses rooms after resolving the saved room details on edit', async () => {
  const savedId = '11111111-1111-1111-1111-111111111111';
  const queries: string[] = [];
  mswServer.use(
    http.get(`*/api/app/room/${savedId}`, () => HttpResponse.json({ ...rooms[0], id: savedId })),
    http.get('*/api/app/room', ({ request }) => {
      const filter = new URL(request.url).searchParams.get('filter') ?? '';
      queries.push(filter);
      return HttpResponse.json({ items: filter.includes('›') ? [] : rooms, totalCount: 3 });
    })
  );
  const { input, onChange } = renderPicker(savedId);
  await waitFor(() => expect(input).toHaveValue('Science Block › First Floor › B101'));
  fireEvent.mouseDown(input);
  expect(await screen.findByRole('option', { name: 'A001' })).toBeVisible();
  await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
  expect(queries.some((query) => query.includes('›'))).toBe(false);
  expect(onChange).not.toHaveBeenCalled();
});
