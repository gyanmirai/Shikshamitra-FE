import { it, vi, expect, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { prepareProgressNetwork } from 'src/screens/academic/course-management/lessonPlan/components/lesson-plan-progress-test-fixture';

import AssignRoomDialog from './AssignRoomDialog';
import {
  subject,
  makeRoomSlots,
  prepareRoomNetwork,
  createRoomTestWrapper,
} from './room-defaults-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
beforeEach(async () => {
  await prepareProgressNetwork();
  prepareRoomNetwork();
});

it('prefills the division room and saves a different room for only this lecture', async () => {
  const slots = makeRoomSlots();
  const onSave = vi.fn();
  render(
    <AssignRoomDialog
      open={{ day: 'MONDAY', slotIndex: 0, subjects: [subject] }}
      slots={slots}
      standardId="class-12"
      divisionId="division-a"
      onClose={vi.fn()}
      onSave={onSave}
    />,
    createRoomTestWrapper()
  );

  const roomInput = screen.getByRole('combobox', { name: 'Select Room *' });
  await waitFor(() => expect(roomInput).toHaveValue('Main › First › A101'));
  fireEvent.click(screen.getByRole('button', { name: 'Open' }));
  fireEvent.click(screen.getByRole('option', { name: 'Science Lab' }));
  expect(roomInput).toHaveValue('Science › Ground › Science Lab');
  expect(
    screen.getByRole('checkbox', { name: 'Apply room to all slots of this subject' })
  ).not.toBeChecked();
  expect(
    screen.getByRole('checkbox', { name: 'Apply room to all slots in the timetable' })
  ).not.toBeChecked();
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Submit' })));
  expect(onSave).toHaveBeenCalledWith(
    'MONDAY',
    0,
    [{ ...subject, roomId: 'laboratory', roomName: 'Science Lab' }],
    { applyToAllSlots: {}, applyToAllSubjectSlots: {} }
  );
});

it('keeps a saved lecture override when the division room differs', async () => {
  const lecture = { ...subject, roomId: 'laboratory', roomName: 'Science Lab' };
  const onSave = vi.fn();
  render(
    <AssignRoomDialog
      open={{ day: 'MONDAY', slotIndex: 0, subjects: [lecture] }}
      slots={makeRoomSlots([lecture])}
      standardId="class-12"
      divisionId="division-a"
      onClose={vi.fn()}
      onSave={onSave}
    />,
    createRoomTestWrapper()
  );
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: 'Select Room *' })).toHaveValue(
      'Science › Ground › Science Lab'
    )
  );
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Submit' })));
  expect(onSave).toHaveBeenCalledWith('MONDAY', 0, [lecture], {
    applyToAllSlots: {},
    applyToAllSubjectSlots: {},
  });
});
