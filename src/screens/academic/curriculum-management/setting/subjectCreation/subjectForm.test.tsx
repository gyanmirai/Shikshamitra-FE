import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';

import { renderSubjectForm } from './subject-form-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.setConfig({ testTimeout: 15_000 });
const path = '*/api/academic-mediums/medium-1/subjects';
beforeEach(() => {
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.post(`${path}/check-duplicate`, () =>
      HttpResponse.json({ hasExactDuplicate: false, hasSimilarDuplicate: false })
    )
  );
});

it('identifies missing color, focuses its group, clears feedback after selection and saves once', async () => {
  const saved: unknown[] = [];
  mswServer.use(
    http.post(path, async ({ request }) => {
      saved.push(await request.json());
      return HttpResponse.json({ id: 'new-subject' });
    })
  );
  const user = userEvent.setup();
  const { onClose } = renderSubjectForm();
  await user.type(screen.getByRole('textbox', { name: 'Subject name' }), 'School Choir');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  const error = await screen.findByRole('alert');
  expect(error).toHaveTextContent('Subject color is required');
  const group = screen.getByRole('group', { name: 'Subject color (required)' });
  expect(group).toHaveAttribute('aria-describedby', error.id);
  await waitFor(() => expect(group).toHaveFocus());
  expect(saved).toHaveLength(0);
  await user.click(screen.getByRole('button', { name: 'Dark blue (#0D47A1)' }));
  await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledWith(null, true));
  expect(saved).toEqual([
    expect.objectContaining({ name: 'School Choir', color: '#0D47A1', status: 0 }),
  ]);
});

it.each(['Cancel', 'close', 'Escape'])(
  'guards dirty %s with one in-app decision and preserves the draft on Keep Editing',
  async (action) => {
    const native = vi.fn();
    Object.defineProperty(window, 'confirm', { configurable: true, value: native });
    const user = userEvent.setup();
    const { onClose } = renderSubjectForm();
    const leave = async () =>
      action === 'Escape'
        ? user.keyboard('{Escape}')
        : user.click(screen.getByRole('button', { name: action }));
    await user.type(screen.getByRole('textbox', { name: 'Subject name' }), 'School Choir');
    await leave();
    const decision = await screen.findByRole('dialog', { name: 'Discard Unsaved Changes?' });
    await user.click(within(decision).getByRole('button', { name: 'Keep Editing' }));
    expect(screen.getByRole('textbox', { name: 'Subject name' })).toHaveValue('School Choir');
    expect(onClose).not.toHaveBeenCalled();
    await leave();
    await user.click(screen.getByRole('button', { name: 'Discard Changes' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith(null, false));
    expect(native).not.toHaveBeenCalled();
  }
);

it('closes a clean form without a discard decision', async () => {
  const { onClose } = renderSubjectForm();
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onClose).toHaveBeenCalledWith(null, false);
  expect(
    screen.queryByRole('dialog', { name: 'Discard Unsaved Changes?' })
  ).not.toBeInTheDocument();
});

it('locks conflicting controls during save and preserves values after failure for a successful retry', async () => {
  let attempts = 0;
  let release: () => void = () => {};
  mswServer.use(
    http.post(path, async () => {
      attempts += 1;
      if (attempts === 1) {
        await new Promise<void>((resolve) => {
          release = resolve;
        });
        return HttpResponse.json({ message: 'Please retry this save.' }, { status: 409 });
      }
      return HttpResponse.json({ id: 'saved-subject' });
    })
  );
  const user = userEvent.setup();
  const { onClose } = renderSubjectForm();
  await user.type(screen.getByRole('textbox', { name: 'Subject name' }), 'School Choir');
  await user.click(screen.getByRole('button', { name: 'Dark blue (#0D47A1)' }));
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(attempts).toBe(1));
  expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('textbox', { name: 'Subject name' })).toBeDisabled();
  fireEvent.keyDown(screen.getByRole('dialog', { name: 'Add Subject' }), { key: 'Escape' });
  expect(onClose).not.toHaveBeenCalled();
  release();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  expect(screen.getByRole('textbox', { name: 'Subject name' })).toHaveValue('School Choir');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledWith(null, true));
  expect(attempts).toBe(2);
});
