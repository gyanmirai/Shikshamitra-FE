import type { FormikProps } from 'formik';

import React from 'react';
import { useFormik } from 'formik';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import BookCopiesStep from './BookCopiesStep';
import { CopyLocationField } from './CopyLocationField';
import { BookClassificationFields } from './BookClassificationFields';
import { getInitialBookData } from '../Components/BookManageInitialValues';
import { makeStatusTestWrapper } from '../../circulation/copy-status-test-fixture';

import type { BookFormValues } from '../Components/type';
import type { LibrarySectionOption } from './CopyLocationField';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));
vi.mock('./BookCopiesTable', () => ({
  BookCopiesTable: ({
    formik,
    sections,
    disabled,
  }: {
    formik: FormikProps<BookFormValues>;
    sections: LibrarySectionOption[];
    disabled: boolean;
  }) => (
    <>
      <CopyLocationField
        formik={formik}
        sections={sections}
        index={0}
        field="section"
        disabled={disabled}
      />
      <CopyLocationField
        formik={formik}
        sections={sections}
        index={0}
        field="shelf"
        disabled={disabled}
      />
    </>
  ),
}));

function Harness() {
  const formik = useFormik({
    initialValues: getInitialBookData({ language: 0 }),
    onSubmit: () => undefined,
  });
  return (
    <>
      <BookClassificationFields formik={formik} disabled={false} />
      <BookCopiesStep formik={formik} disabled={false} />
      <output data-testid="editor-values">
        {JSON.stringify({ categoryId: formik.values.categoryId, copy: formik.values.copies[0] })}
      </output>
    </>
  );
}

it('loads real category and copy locations with catalogue Add authority and no Settings grants', async () => {
  let editorReads = 0;
  const settingReads = vi.fn(() =>
    HttpResponse.json({ detail: 'Settings permission required' }, { status: 403 })
  );
  mswServer.use(
    http.get('http://library.test/api/library/books/editor-options', ({ request }) => {
      editorReads += 1;
      expect(new URL(request.url).searchParams.get('academicYearId')).toBe('year-id');
      return HttpResponse.json({
        bookCategories: [{ id: 'category-id', name: 'Fiction' }],
        sections: [
          {
            id: 'section-id',
            sectionName: 'Reading room',
            shelfDetails: [{ id: 'shelf-id', shelfName: 'Shelf A' }],
          },
        ],
      });
    }),
    http.get('http://library.test/api/library/book-categories', settingReads),
    http.get('http://library.test/api/library/sections', settingReads)
  );
  render(<Harness />, makeStatusTestWrapper(['View', 'Add']));
  await waitFor(() => expect(editorReads).toBe(1));
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /^Category/ }));
  fireEvent.click(await screen.findByRole('option', { name: 'Fiction' }));
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /^Section/ }));
  fireEvent.click(await screen.findByRole('option', { name: 'Reading room' }));
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /^Shelf/ }));
  fireEvent.click(await screen.findByRole('option', { name: 'Shelf A' }));
  await waitFor(() =>
    expect(screen.getByTestId('editor-values')).toHaveTextContent('"shelf":"shelf-id"')
  );
  expect(screen.getByTestId('editor-values')).toHaveTextContent('"categoryId":"category-id"');
  expect(settingReads).not.toHaveBeenCalled();
});
