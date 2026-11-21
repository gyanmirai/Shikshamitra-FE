import { useFormik } from 'formik';
import { it, vi, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import {
  catalogueBook,
  catalogueDefaults,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-data';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-fixture';

import { BookStockFields } from './BookStockFields';
import { createCatalogueBookSchemas } from './catalogue-book-schema';
import { getInitialBookData } from '../Components/BookManageInitialValues';

function PriceFieldForm({ price, submit }: { price: string; submit: (values: unknown) => void }) {
  const formik = useFormik({
    initialValues: { ...catalogueBook(), price },
    validationSchema: createCatalogueBookSchemas(catalogueDefaults)[0],
    onSubmit: submit,
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <BookStockFields formik={formik} disabled={false} />
      <output data-testid="price-draft">{formik.values.price}</output>
      <button type="submit">Save price test</button>
    </form>
  );
}

it('presents blank new catalogue price as optional and submits unknown without inventing zero', async () => {
  const submit = vi.fn();
  render(<PriceFieldForm price={getInitialBookData().price} submit={submit} />, {
    wrapper: catalogueTestWrapper(
      catalogueTestStore(['Library.AllBooks.View', 'Library.AllBooks.Add'])
    ),
  });
  const input = screen.getByRole('textbox', { name: /^Price per book/i });
  expect(input).toHaveValue('');
  expect(input).not.toBeRequired();
  fireEvent.click(screen.getByRole('button', { name: 'Save price test' }));
  await waitFor(() => expect(submit).toHaveBeenCalled());
  expect(submit.mock.calls[0][0]).toMatchObject({ price: '' });
});

it('retains a pasted subcent draft and rejects it instead of silently rounding', async () => {
  const submit = vi.fn();
  render(<PriceFieldForm price="40.25" submit={submit} />, {
    wrapper: catalogueTestWrapper(
      catalogueTestStore(['Library.AllBooks.View', 'Library.AllBooks.Update'])
    ),
  });
  const input = screen.getByRole('textbox', { name: /^Price per book/i });
  fireEvent.change(input, { target: { value: '1.001' } });
  fireEvent.blur(input);
  fireEvent.click(screen.getByRole('button', { name: 'Save price test' }));
  await waitFor(() => expect(screen.getByTestId('price-draft')).toHaveTextContent('1.001'));
  expect(submit).not.toHaveBeenCalled();
  expect(screen.getByText(/2 decimal places/i)).toBeVisible();
});
