import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach } from 'vitest';
import { guardAcademicContextChange } from 'src/hooks/academic-context-change';
import { act, screen, within, waitFor, fireEvent } from '@testing-library/react';

import {
  sectionApiRoot,
  changeShelfCount,
  openSectionEditor,
  changeSectionName,
  mountSectionScreen,
} from './section-editor.fixture';

const originalConfirm = Object.getOwnPropertyDescriptor(window, 'confirm');
afterEach(() => {
  if (originalConfirm) Object.defineProperty(window, 'confirm', originalConfirm);
  else Reflect.deleteProperty(window, 'confirm');
});

it.each(['Cancel', 'close'])(
  'uses one retained-draft confirmation for dirty %s',
  async (action) => {
    let commands = 0;
    const nativeConfirm = vi.fn(() => false);
    Object.defineProperty(window, 'confirm', {
      value: nativeConfirm,
      configurable: true,
      writable: true,
    });
    mswServer.use(
      http.post(sectionApiRoot, () => {
        commands += 1;
        return HttpResponse.json({ id: 'unexpected-write' });
      })
    );
    mountSectionScreen();
    const editor = await openSectionEditor();
    changeSectionName('Learning Corner');
    changeShelfCount('1');
    fireEvent.click(within(editor).getByRole('button', { name: action }));
    expect(nativeConfirm).not.toHaveBeenCalled();
    const discard = await screen.findByRole('dialog', { name: /Discard Unsaved Changes/i });
    expect(screen.getByDisplayValue('Learning Corner')).toBeInTheDocument();
    fireEvent.click(within(discard).getByRole('button', { name: /^Keep editing$/i }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: /Discard Unsaved Changes/i })).toBeNull()
    );
    expect(screen.getByRole('textbox', { name: /Section Name/i })).toHaveValue('Learning Corner');
    fireEvent.click(within(editor).getByRole('button', { name: action }));
    const repeated = await screen.findByRole('dialog', { name: /Discard Unsaved Changes/i });
    fireEvent.click(within(repeated).getByRole('button', { name: /^Discard changes$/i }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /Add Section/i })).toBeNull());
    expect(commands).toBe(0);
  }
);

it('discards and closes the permanent section draft once before an approved context change', async () => {
  let commands = 0;
  mswServer.use(
    http.post(sectionApiRoot, () => {
      commands += 1;
      return HttpResponse.json({ id: 'unexpected-write' });
    })
  );
  mountSectionScreen();
  await openSectionEditor();
  changeSectionName('Learning Corner');
  changeShelfCount('1');
  const proceed = vi.fn();
  let guarded = false;
  act(() => {
    guarded = guardAcademicContextChange(proceed);
  });
  expect(guarded).toBe(true);
  expect(proceed).not.toHaveBeenCalled();
  const confirmation = await screen.findByRole('dialog', { name: /Discard Unsaved Changes/i });
  fireEvent.click(within(confirmation).getByRole('button', { name: 'Discard changes' }));
  expect(proceed).toHaveBeenCalledOnce();
  await waitFor(() => expect(screen.queryByRole('dialog', { name: /Add Section/i })).toBeNull());
  expect(commands).toBe(0);
  expect(screen.getByRole('button', { name: 'Edit Reading Room' })).toBeVisible();
});
