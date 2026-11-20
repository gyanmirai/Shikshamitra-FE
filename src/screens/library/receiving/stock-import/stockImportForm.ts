import type { LibraryStockSource } from 'src/redux/library/receiving-types';
import type { CatalogueConfiguration } from 'src/redux/library/catalogue-configuration-types';

import * as Yup from 'yup';

export type StockImportValues = {
  academicYearId: string;
  sectionId: string;
  shelfId: string;
  categoryId: string;
  receivedOn: string;
  source: LibraryStockSource | null;
  sourceName: string;
  columnMap: Record<string, string>;
};

export const initialImportValues: StockImportValues = {
  academicYearId: '',
  sectionId: '',
  shelfId: '',
  categoryId: '',
  receivedOn: '',
  source: null,
  sourceName: '',
  columnMap: {},
};

export const importSchema = Yup.object({
  sectionId: Yup.string().required('Choose a section.'),
  shelfId: Yup.string().required('Choose a shelf.'),
  receivedOn: Yup.string()
    .required('Enter the default receipt date.')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Enter a school calendar date.'),
  source: Yup.number().nullable().oneOf([0, 1, 2, 3]).required('Choose a stock source.'),
  sourceName: Yup.string().max(256, 'Use up to 256 characters.'),
});

export const importColumns = [
  'SourceRowId',
  'BookId',
  'TitleKey',
  'Title',
  'Author',
  'Isbn',
  'Edition',
  'Publisher',
  'Subject',
  'LanguageCode',
  'MaterialCode',
  'ApplicableAge',
  'CataloguePrice',
  'Pages',
  'Accession',
  'ReceivedOn',
  'UnitCost',
  'Currency',
];

export async function readStockCsv(file: File) {
  if (!file.name.toLowerCase().endsWith('.csv') || file.size < 1 || file.size > 1024 * 1024)
    throw new Error('Choose a UTF-8 CSV file up to 1 MiB.');
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
  } catch {
    throw new Error('Could not read the file as UTF-8. Save it as UTF-8 CSV and try again.');
  }
}

export function downloadImportCsv(name: string, rows: (string | number | null)[][]) {
  const lines = rows.map((row) =>
    row
      .map((cell) => {
        const text = String(cell ?? '');
        const safe = /^\s*[=+@-]|^[\r\n\t]/.test(text) ? `'${text}` : text;
        return `"${safe.replaceAll('"', '""')}"`;
      })
      .join(',')
  );
  const url = URL.createObjectURL(
    new Blob([`\uFEFF${lines.join('\r\n')}\r\n`], { type: 'text/csv;charset=utf-8' })
  );
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadStockImportTemplate(
  configuration?: CatalogueConfiguration | null,
  bookId?: string
) {
  const example: Record<string, string> = { SourceRowId: 'BOOK-DRIVE-0001', Accession: '000012' };
  if (bookId) example.BookId = bookId;
  else if (configuration) {
    example.TitleKey = 'folktales';
    example.Title = 'School Folktales';
    example.Author = 'School Reading Club';
    example.LanguageCode = configuration.languages.find((option) => option.isActive)?.code ?? '';
    example.MaterialCode = configuration.materials.find((option) => option.isActive)?.code ?? '';
  }
  downloadImportCsv('library-stock-import-template.csv', [
    importColumns,
    ...(configuration || bookId ? [importColumns.map((column) => example[column] ?? '')] : []),
  ]);
}
