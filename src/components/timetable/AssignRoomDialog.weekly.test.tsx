import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { prepareProgressNetwork } from 'src/screens/academic/course-management/lessonPlan/components/lesson-plan-progress-test-fixture';

import AssignRoomDialog from './AssignRoomDialog';
import {
  rooms,
  subject,
  makeRoomSlots,
  prepareRoomNetwork,
  createRoomTestWrapper,
} from './room-defaults-test-fixture';

import type { SlotSubject } from './types';

vi.mock('../iconify', () => ({ Iconify: () => null }));

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
beforeEach(async () => {
  await prepareProgressNetwork();
  prepareRoomNetwork();
});

const availabilityUrl = '*/api/academics/timetable/room-availability';
function renderDialog(onSave = vi.fn(), onClose = vi.fn(), subjects: SlotSubject[] = [subject]) {
  render(
    <AssignRoomDialog
      open={{ day: 'MONDAY', slotIndex: 0, subjects }}
      slots={makeRoomSlots(subjects)}
      standardId="class-12"
      divisionId="division-a"
      onClose={onClose}
      onSave={onSave}
    />,
    createRoomTestWrapper()
  );
  return { onSave, onClose };
}

it('loads weekly rooms without a calendar date even when the dated response is blocked by vacation', async () => {
  const requests: URL[] = [];
  mswServer.use(
    http.get(availabilityUrl, ({ request }) => {
      const url = new URL(request.url);
      requests.push(url);
      return HttpResponse.json(
        rooms.map((room) => ({
          ...room,
          roomId: room.id,
          status:
            url.searchParams.get('weeklyTimetableDay') === 'Monday' ? 'available' : 'occupied',
          conflictReason: 'Date blocked: Diwali vacation (Vacation).',
        }))
      );
    })
  );
  renderDialog();
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: 'Select Room *' })).toHaveValue(
      'Main › First › A101'
    )
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open' }));
  expect(await screen.findByRole('option', { name: 'Science Lab' })).toBeVisible();
  expect(requests[0].searchParams.get('weeklyTimetableDay')).toBe('Monday');
  expect(requests[0].searchParams.has('date')).toBe(false);
  expect(requests[0].searchParams.get('startTime')).toBe('09:00:00');
});

it('keeps an empty weekly result empty instead of falling back to the room catalogue', async () => {
  mswServer.use(http.get(availabilityUrl, () => HttpResponse.json([])));
  renderDialog();
  expect(
    await screen.findByText(
      'No rooms are configured. Add rooms in Institute Setup before assigning this period.'
    )
  ).toBeVisible();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
});

it('keeps a room selected for one elective out of the other elective options', async () => {
  renderDialog(vi.fn(), vi.fn(), [subject, { ...subject, subjectId: 'pt', name: 'Pt' }]);
  const inputs = screen.getAllByRole('combobox', { name: 'Select Room *' });
  await waitFor(() => expect(inputs[0]).toHaveValue('Main › First › A101'));
  fireEvent.click(screen.getAllByRole('button', { name: 'Open' })[1]);
  expect(await screen.findByRole('option', { name: 'Science Lab' })).toBeVisible();
  expect(screen.queryByRole('option', { name: 'A101' })).not.toBeInTheDocument();
});

it('shows a failed weekly-room read and retries instead of treating the room catalogue as available', async () => {
  let failed = true;
  mswServer.use(
    http.get(availabilityUrl, () =>
      failed
        ? HttpResponse.json({ message: 'Unavailable' }, { status: 500 })
        : HttpResponse.json(
            rooms.map((room) => ({ ...room, roomId: room.id, status: 'available' }))
          )
    )
  );
  renderDialog();
  expect(await screen.findByText('Unable to load rooms for this weekly period.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  failed = false;
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() =>
    expect(
      screen.queryByText('Unable to load rooms for this weekly period.')
    ).not.toBeInTheDocument()
  );
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
});

it('keeps the dialog and draft open when timetable validation rejects an actual room conflict', async () => {
  const issue = {
    title: 'Room conflict',
    description: 'Science Lab is already assigned to Class 9 on Monday 09:00–10:00.',
  };
  const onSave = vi.fn().mockResolvedValue([issue]);
  const { onClose } = renderDialog(onSave);
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: 'Select Room *' })).toHaveValue(
      'Main › First › A101'
    )
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open' }));
  fireEvent.click(await screen.findByRole('option', { name: 'Science Lab' }));
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Submit' })));
  expect((await screen.findAllByText(issue.description))[0]).toBeVisible();
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole('combobox', { name: 'Select Room *' })).toHaveValue(
    'Science › Ground › Science Lab'
  );
});
