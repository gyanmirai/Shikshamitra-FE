import { useFormik } from 'formik';
import { it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { catalogueDefaults } from './catalogue-test-data';
import { CatalogueChoicesSection } from './CatalogueChoicesSection';
import { copyCatalogueDefinition } from './catalogue-configuration-form';
import { catalogueTestStore, catalogueTestWrapper } from './catalogue-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

function Harness() {
  const formik = useFormik({
    initialValues: copyCatalogueDefinition(catalogueDefaults),
    onSubmit: () => undefined,
  });
  return (
    <CatalogueChoicesSection
      formik={formik}
      previous={catalogueDefaults}
      field="languages"
      disabled={false}
    />
  );
}

it('keeps a new duplicate-code row editable/removable rather than mistaking it for a saved choice', () => {
  render(<Harness />, { wrapper: catalogueTestWrapper(catalogueTestStore()) });
  fireEvent.click(screen.getByRole('button', { name: 'Add language' }));
  const code = screen.getAllByRole('textbox', { name: 'Language code' }).at(-1)!;
  fireEvent.change(code, { target: { value: 'gu' } });
  expect(code).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Remove new language gu' })).toBeEnabled();
  fireEvent.change(code, { target: { value: 'bn' } });
  expect(code).toHaveValue('bn');
});
