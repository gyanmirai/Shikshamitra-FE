import { it, vi, expect } from 'vitest';
import { mapBookDetailDto } from 'src/redux/library/library-adapters';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
  {
    language: 0,
    languageCode: 'gu',
    languageLabel: 'Gujarati',
    materialCode: null,
    materialLabel: null,
  },
  {
    language: null,
    languageCode: 'bn',
    languageLabel: 'Bengali (বাংলা)',
    materialCode: 'picturebook',
    materialLabel: 'Picture book',
  },
])(
  'shows the actual View-owned labels for $languageCode without settings/editor grants',
  async (metadata) => {
    const book = mapBookDetailDto({ ...statusCopy.book, ...metadata });
    render(<BookViewBasicDetail book={book} />, {
      wrapper: catalogueTestWrapper(catalogueTestStore(['Library.AllBooks.View'])),
    });
    fireEvent.click(screen.getByRole('button', { name: /Book Details/ }));
    await waitFor(() => expect(screen.getByText(metadata.languageLabel)).toBeVisible());
    if (metadata.materialLabel) expect(screen.getByText(metadata.materialLabel)).toBeVisible();
  }
);
