import React from 'react';
import { useFormik } from 'formik';
import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CopyLocationField } from './CopyLocationField';
import { getInitialBookData } from '../Components/BookManageInitialValues';

function Harness({ persisted }: { persisted: boolean }) {
  const formik = useFormik({
    initialValues: getInitialBookData({
      copies: [
        {
          copyId: persisted ? 'saved-copy' : undefined,
          copyNo: 7,
          accessionNo: 'SCHOOL/7',
          sectionId: 'section-a',
          shelfId: 'shelf-a',
          section: 'section-a',
          shelf: 'shelf-a',
        },
      ],
    }),
    onSubmit: () => undefined,
  });
  return (
    <CopyLocationField
      formik={formik}
      index={0}
      field="section"
      disabled={false}
      sections={[
        {
          id: 'section-a',
          sectionName: 'Reading room',
          shelfDetails: [{ id: 'shelf-a', shelfName: 'Shelf A' }],
        },
      ]}
    />
  );
}
it('locks persisted locations and directs saved copy changes to Move', () => {
  render(<Harness persisted />);
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-disabled', 'true');
  expect(screen.getByText(/Use Move copy/)).toBeInTheDocument();
});
it('keeps location assignment available for an unsaved copy', () => {
  render(<Harness persisted={false} />);
  expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-disabled', 'true');
});
