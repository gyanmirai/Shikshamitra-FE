import type { LibraryBookEditorOptions } from 'src/redux/library/book-editor-api';

import { createContext } from 'react';

export type BookEditorOptionsSnapshot = {
  academicYearId: string;
  options: LibraryBookEditorOptions;
  refresh: () => void;
};

export const BookEditorOptionsContext = createContext<BookEditorOptionsSnapshot | null>(null);
