import { it, vi, expect } from 'vitest';
import { formatNumber } from 'src/utils/formate_number';
import { render, screen, fireEvent } from '@testing-library/react';
import { mapBookDetailDto } from 'src/redux/library/library-adapters';
import { statusCopy } from 'src/screens/library/circulation/copy-status-test-fixture';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-fixture';

import BookViewBasicDetail from './BookBasicDetails';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

it.each([
  { price: null, priceText: null, label: 'Unknown' },
  { price: 0, priceText: '0.00', label: formatNumber('0.00', undefined, { fractionDigits: 2 }) },
  {
    price: 10000000000000000,
    priceText: '9999999999999999.99',
    label: formatNumber('9999999999999999.99', undefined, { fractionDigits: 2 }),
  },
])('shows catalogue price $priceText honestly under catalogue View alone', (price) => {
  const book = mapBookDetailDto({
    ...statusCopy.book,
    price: price.price,
    priceText: price.priceText,
  });
  render(<BookViewBasicDetail book={book} />, {
    wrapper: catalogueTestWrapper(catalogueTestStore(['Library.AllBooks.View'])),
  });
  fireEvent.click(screen.getByRole('button', { name: /Book Details/ }));
  expect(screen.getByText(price.label)).toBeVisible();
  expect(screen.queryByText(/₹/)).not.toBeInTheDocument();
});
