import type { BookFormValues } from 'src/screens/library/BookManagement/Components/type';

import { useFormik } from 'formik';
import { it, vi, expect } from 'vitest';
import { formatNumber } from 'src/utils/formate_number';
import { mapBookDetailDto } from 'src/redux/library/library-adapters';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BookStockFields } from 'src/screens/library/BookManagement/BookFormComponents/BookStockFields';
import { getInitialBookData } from 'src/screens/library/BookManagement/Components/BookManageInitialValues';
import { createCatalogueBookSchemas } from 'src/screens/library/BookManagement/BookFormComponents/catalogue-book-schema';
import {
  catalogueBook,
  catalogueDefaults,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-data';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-fixture';

import BookViewBasicDetail from './BookBasicDetails';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

const bookId = '7a1959fa-2e3b-401a-bf57-3c43fcbebbd0';
const saved = { languageCode: 'en', bookId, price: '-1.25' };
const wrapper = catalogueTestWrapper(catalogueTestStore(['Library.AllBooks.View']));

it('shows an exact historic negative price truthfully without applying new-write validation', () => {
  const book = mapBookDetailDto({
    ...catalogueBook(),
    id: bookId,
    price: -1.25,
    priceText: '-1.25',
  });
  render(<BookViewBasicDetail book={book} />, { wrapper });
  fireEvent.click(screen.getByRole('button', { name: /Book Details/ }));
  expect(screen.getByText(formatNumber('-1.25', undefined, { fractionDigits: 2 }))).toBeVisible();
});

function HistoricPriceForm({ submit }: { submit: (values: unknown) => void }) {
  const formik = useFormik<BookFormValues>({
    initialValues: {
      ...catalogueBook(),
      id: bookId,
      price: getInitialBookData({ id: bookId, price: -1.25, priceText: '-1.25' }).price,
    },
    validationSchema: createCatalogueBookSchemas(catalogueDefaults, saved)[0],
    onSubmit: submit,
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <BookStockFields formik={formik} disabled={false} />
      <output data-testid="historic-price-draft">{formik.values.price}</output>
      <button type="submit">Save historic price test</button>
    </form>
  );
}

it('displays the original minus sign, preserves it on metadata save and rejects a changed negative draft', async () => {
  const submit = vi.fn();
  render(<HistoricPriceForm submit={submit} />, { wrapper });
  const input = screen.getByRole('textbox', { name: /^Price per book/i });
  expect(input).toHaveValue('-1.25');
  fireEvent.click(screen.getByRole('button', { name: 'Save historic price test' }));
  await waitFor(() => expect(submit).toHaveBeenCalled());
  expect(submit.mock.calls[0][0]).toMatchObject({ price: '-1.25' });
  submit.mockClear();
  fireEvent.change(input, { target: { value: '-2.25' } });
  fireEvent.blur(input);
  fireEvent.click(screen.getByRole('button', { name: 'Save historic price test' }));
  await waitFor(() => expect(screen.getByText(/2 decimal places/i)).toBeVisible());
  expect(screen.getByTestId('historic-price-draft')).toHaveTextContent('-2.25');
  expect(submit).not.toHaveBeenCalled();
});
