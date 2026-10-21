import { useFormik } from 'formik';
import { it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { DocumentDetailsFields } from './document-details-fields';

import type { DocumentFormValues } from '../types';

function DocumentFields({ editing = false }: { editing?: boolean }) {
  const formik = useFormik<DocumentFormValues>({
    initialValues: {
      name: editing ? 'existing CBSE approval' : '',
      notes: editing ? 'existing note' : '',
      category: 0,
      files: [],
      retainedFiles: [],
    },
    onSubmit: () => {},
  });
  return <DocumentDetailsFields formik={formik} />;
}

it('capitalizes typed or pasted document names and notes without lowercasing abbreviations', () => {
  render(<DocumentFields />);
  const name = screen.getByLabelText(/Document name/);
  const notes = screen.getByLabelText('Notes');
  fireEvent.change(name, { target: { value: 'division CBSE Approval' } });
  fireEvent.change(notes, { target: { value: '  approved by CBSE\nkeep PDF copy' } });
  expect(name).toHaveValue('Division CBSE Approval');
  expect(notes).toHaveValue('  Approved by CBSE\nkeep PDF copy');
  fireEvent.change(name, { target: { value: '' } });
  expect(name).toHaveValue('');
});

it('leaves saved values unchanged when the edit form opens', () => {
  render(<DocumentFields editing />);
  expect(screen.getByLabelText(/Document name/)).toHaveValue('existing CBSE approval');
  expect(screen.getByLabelText('Notes')).toHaveValue('existing note');
});
