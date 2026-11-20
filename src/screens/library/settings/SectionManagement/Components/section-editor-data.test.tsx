import { it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import {
  savedSection,
  sectionApiRoot,
  changeShelfCount,
  openSectionEditor,
  changeSectionName,
  mountSectionScreen,
} from './section-editor.fixture';

it('preserves actual API-shaped shelf names when editing the section name', async () => {
  let payload: unknown;
  mswServer.use(
    http.put(`${sectionApiRoot}/${savedSection.id}`, async ({ request }) => {
      payload = await request.json();
      return HttpResponse.json({ id: savedSection.id, message: 'Saved.' });
    })
  );
  mountSectionScreen();
  await openSectionEditor(true);
  await waitFor(() =>
    expect(
      screen.queryByDisplayValue('બાળ પુસ્તકો') ?? screen.queryByText('બાળ પુસ્તકો')
    ).not.toBeNull()
  );
  expect(screen.queryByDisplayValue('Référence') ?? screen.queryByText('Référence')).not.toBeNull();
  changeSectionName('Reading Room North');
  fireEvent.click(screen.getByRole('button', { name: /^(Submit|Update)$/ }));
  await waitFor(() =>
    expect(payload).toEqual({
      sectionName: 'Reading Room North',
      numberOfShelf: 2,
      shelfItems: ['બાળ પુસ્તકો', 'Référence'],
    })
  );
});

it('keeps Unicode, accents and punctuation in the entered name and actual create command', async () => {
  let payload: unknown;
  let year: string | null = null;
  mswServer.use(
    http.post(sectionApiRoot, async ({ request }) => {
      payload = await request.json();
      year = new URL(request.url).searchParams.get('academicYearId');
      return HttpResponse.json({ id: 'created-section', message: 'Saved.' });
    })
  );
  mountSectionScreen();
  await openSectionEditor();
  const entered = 'બાળ-પુસ્તકાલય École';
  changeSectionName(entered);
  changeShelfCount('1');
  expect(screen.getByRole('textbox', { name: /Section Name/i })).toHaveValue(entered);
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(payload).toEqual({
      sectionName: entered,
      numberOfShelf: 1,
      shelfItems: ['Shelf 1'],
    })
  );
  expect(year).toBe('year-id');
});
