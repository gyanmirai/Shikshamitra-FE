import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { _api as iconifyApi } from '@iconify/react';
import { vi, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';

import { renderBuildingForm, createBuildingFormStore } from './building-form-test-utils';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const building = {
  id: 1,
  buildingName: 'Main Block',
  totalFloors: 1,
  description: '',
  floors: [{ id: 'floor-a', floorNo: 1, floorName: 'First Floor', totalRoom: 5, roomCount: 0 }],
};
const onClose = vi.fn();

beforeEach(() => {
  onClose.mockClear();
  iconifyApi.setFetch((...args) => fetch(...args));
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/institute-setup/buildings/1', () => HttpResponse.json(building)),
    http.get('https://api.iconify.design/:collection', ({ request, params }) =>
      HttpResponse.json({
        prefix: String(params.collection).replace('.json', ''),
        icons: {},
        not_found: new URL(request.url).searchParams.get('icons')?.split(',') ?? [],
      })
    )
  );
});

it('blocks an invalid decrease next to the floor field without submitting', async () => {
  let writes = 0;
  mswServer.use(
    http.put('*/api/institute-setup/buildings/1', () => {
      writes += 1;
      return HttpResponse.json(building);
    })
  );
  renderBuildingForm(createBuildingFormStore(), onClose, building, null, false);
  await waitFor(() => expect(screen.getByRole('button', { name: /Update|Submit/ })).toBeEnabled());
  fireEvent.change(screen.getByLabelText(/^Total rooms/i), { target: { value: '0' } });
  fireEvent.click(screen.getByRole('button', { name: /Update|Submit/ }));
  expect(await screen.findByText('Floor must have at least 1 room')).toBeInTheDocument();
  expect(writes).toBe(0);
  expect(onClose).not.toHaveBeenCalled();
});

it('shows an over-limit description immediately and preserves it for correction', async () => {
  const overLimit = 'a'.repeat(532);
  renderBuildingForm(createBuildingFormStore(), onClose, { ...building, description: overLimit });
  const description = screen.getByRole('textbox', { name: 'Description' });

  expect(description).toHaveValue(overLimit);
  expect(description).toHaveAttribute('maxlength', '500');
  expect(description).toHaveAccessibleDescription('Use 500 characters or fewer');
  expect(description).toBeInvalid();
  fireEvent.change(description, { target: { value: 'a'.repeat(500) } });
  await waitFor(() => expect(description).toBeValid());
  expect(description).toHaveAccessibleDescription('500/500 characters');
});

it('shows progress on Refresh room counts and on Submit only for their own requests', async () => {
  const refreshResponse = Promise.withResolvers<void>();
  const saveResponse = Promise.withResolvers<void>();
  let refreshRequested = false;
  mswServer.use(
    http.get('*/api/institute-setup/buildings/1', async () => {
      if (refreshRequested) await refreshResponse.promise;
      return HttpResponse.json(building);
    }),
    http.put('*/api/institute-setup/buildings/1', async () => {
      await saveResponse.promise;
      return HttpResponse.json(building);
    })
  );
  renderBuildingForm(createBuildingFormStore(), onClose, building, null, false);
  const submit = screen.getByRole('button', { name: 'Submit' });
  const refresh = screen.getByRole('button', { name: 'Refresh room counts' });
  try {
    await waitFor(() => expect(submit).toBeEnabled(), { timeout: 5000 });
    refreshRequested = true;
    fireEvent.click(refresh);
    expect(await within(refresh).findByRole('progressbar')).toBeInTheDocument();
    expect(submit).toBeDisabled();
    expect(within(submit).queryByRole('progressbar')).not.toBeInTheDocument();
    refreshResponse.resolve();

    await waitFor(() => expect(submit).toBeEnabled());
    fireEvent.click(submit);
    expect(await within(submit).findByRole('progressbar')).toBeInTheDocument();
    expect(within(refresh).queryByRole('progressbar')).not.toBeInTheDocument();
    saveResponse.resolve();
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  } finally {
    refreshResponse.resolve();
    saveResponse.resolve();
  }
});

it('allows editing another field after focusing an invalid submission', async () => {
  const user = userEvent.setup();
  renderBuildingForm(createBuildingFormStore(), onClose, building, null, false);
  await waitFor(() => expect(screen.getByRole('button', { name: /Update|Submit/ })).toBeEnabled());
  const capacity = screen.getByLabelText(/^Total rooms/i);
  fireEvent.change(capacity, { target: { value: '0' } });
  fireEvent.click(screen.getByRole('button', { name: /Update|Submit/ }));
  await waitFor(() => expect(capacity).toHaveFocus());
  const name = screen.getByLabelText(/^Building name/i);
  await user.click(name);
  await user.clear(name);
  await user.type(name, 'Main Block Revised');
  expect(name).toHaveFocus();
  expect(name).toHaveValue('Main Block Revised');
  expect(screen.getByText('Floor must have at least 1 room')).toBeInTheDocument();
});

it('retains the draft on a rejected save and closes only after a successful retry', async () => {
  mswServer.use(
    http.put('*/api/institute-setup/buildings/1', () =>
      HttpResponse.json({ detail: 'Building save failed. Try again.' }, { status: 500 })
    )
  );
  renderBuildingForm(createBuildingFormStore(), onClose, building, null, false);
  await waitFor(() => expect(screen.getByRole('button', { name: /Update|Submit/ })).toBeEnabled());
  fireEvent.change(screen.getByLabelText(/^Total rooms/i), { target: { value: '3' } });
  fireEvent.click(screen.getByRole('button', { name: /Update|Submit/ }));
  expect(await screen.findByText('Building save failed. Try again.')).toBeInTheDocument();
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByLabelText(/^Total rooms/i)).toHaveValue('3');

  let saved: Record<string, unknown> | undefined;
  mswServer.use(
    http.put('*/api/institute-setup/buildings/1', async ({ request }) => {
      saved = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json(building);
    })
  );
  fireEvent.click(screen.getByRole('button', { name: /Update|Submit/ }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(saved).toMatchObject({ floorsToUpdate: [{ id: 'floor-a', totalRoom: 3 }] });
  expect((saved?.floorsToUpdate as Record<string, unknown>[])[0]).not.toHaveProperty('roomCount');
});

it('refreshes usage after a capacity conflict and permits recovery without discarding the draft', async () => {
  let count = 0;
  let writes = 0;
  let failRefresh = false;
  mswServer.use(
    http.get('*/api/institute-setup/buildings/1', () =>
      failRefresh
        ? HttpResponse.json({ detail: 'Counts unavailable.' }, { status: 500 })
        : HttpResponse.json({ ...building, floors: [{ ...building.floors[0], roomCount: count }] })
    ),
    http.put('*/api/institute-setup/buildings/1', () => {
      writes += 1;
      return writes === 1
        ? HttpResponse.json(
            {
              errorCode: 'ShikshaMitra.TenantSettings:FloorRoomLimitBelowUsage',
              detail: 'Capacity changed.',
              data: { FloorId: 'floor-a', FloorName: 'First Floor', RoomLimit: 2, RoomCount: 3 },
            },
            { status: 400 }
          )
        : HttpResponse.json(building);
    })
  );
  renderBuildingForm(createBuildingFormStore(), onClose, building, null, false);
  await waitFor(() => expect(screen.getByRole('button', { name: /Update|Submit/ })).toBeEnabled());
  fireEvent.change(screen.getByLabelText(/^Total rooms/i), { target: { value: '2' } });
  fireEvent.click(screen.getByRole('button', { name: /Update|Submit/ }));
  expect(await screen.findByText(/First Floor already has 3 rooms/)).toBeInTheDocument();
  expect(onClose).not.toHaveBeenCalled();
  count = 0;
  failRefresh = true;
  fireEvent.click(screen.getByRole('button', { name: 'Refresh room counts' }));
  await screen.findByText('Room counts could not be loaded. Retry before updating this building.');
  expect(screen.getByText(/First Floor already has 3 rooms/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Update|Submit/ })).toBeDisabled();
  failRefresh = false;
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(screen.getByRole('button', { name: /Update|Submit/ })).toBeEnabled());
  await waitFor(() =>
    expect(screen.queryByText(/First Floor already has 3 rooms/)).not.toBeInTheDocument()
  );
  expect(screen.getByLabelText(/^Total rooms/i)).toHaveValue('2');
  fireEvent.click(screen.getByRole('button', { name: /Update|Submit/ }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(writes).toBe(2);
});
