import { it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import {
  sectionApiRoot,
  changeShelfName,
  changeShelfCount,
  openSectionEditor,
  changeSectionName,
  mountSectionScreen,
} from './section-editor.fixture';

it.each([
  { names: [''], error: 'Shelf name is required' },
  { names: ['Reference', ' reference '], error: 'Shelf names must be unique' },
])('retains invalid shelf draft without a command: $error', async ({ names, error }) => {
  let commands = 0;
  mswServer.use(
    http.post(sectionApiRoot, () => {
      commands += 1;
      return HttpResponse.json(
        { detail: 'The server rejected this shelf collection.' },
        { status: 400 }
      );
    })
  );
  mountSectionScreen();
  await openSectionEditor();
  changeSectionName('Learning Corner');
  changeShelfCount(String(names.length));
  names.forEach((name, index) => changeShelfName(index, name));
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect({
      commands,
      fieldError: screen.queryByText(error)?.textContent ?? null,
    }).toEqual({ commands: 0, fieldError: error })
  );
  expect(screen.getByRole('textbox', { name: /Section Name/i })).toHaveValue('Learning Corner');
  expect(commands).toBe(0);
});
