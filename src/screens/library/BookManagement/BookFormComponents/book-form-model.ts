import { LibraryBookStatus } from 'src/enums/library-book-status';
import { catalogueLanguageCode } from 'src/redux/library/catalogue-metadata';

import type { IBookCopy, IBookPayload, BookFormValues } from '../Components/type';

type NamedId = { id?: string; name?: string };
export type CopySource = Omit<Partial<IBookCopy>, 'section' | 'shelf'> & {
  copyNumber?: number;
  section?: string | NamedId;
  shelf?: string | NamedId;
};
export type BookSource = Omit<Partial<IBookPayload>, 'copies'> & {
  copies?: CopySource[];
  pages?: number;
};

const locationId = (id: string | undefined, location: string | NamedId | undefined) =>
  id || (typeof location === 'object' ? location?.id : location) || '';

export function normalizeFormCopy(copy: CopySource, index: number): IBookCopy {
  return {
    ...copy,
    id: copy.copyId || copy.id,
    copyId: copy.copyId || copy.id,
    copyNo: copy.copyNo ?? copy.copyNumber ?? index + 1,
    accessionNo: copy.accessionNo || '',
    section: locationId(copy.sectionId, copy.section),
    shelf: locationId(copy.shelfId, copy.shelf),
    status: copy.status ?? LibraryBookStatus.Available,
    role: copy.role || '',
    issueDate: copy.issueDate || '',
    dueDate: copy.dueDate || '',
  };
}

export function resizeDraftCopies(copies: IBookCopy[], requested: number) {
  if (!Number.isInteger(requested) || requested < 0 || requested > 1000) return copies;
  const saved = copies.filter((copy) => copy.copyId || copy.id);
  const drafts = copies.filter((copy) => !copy.copyId && !copy.id);
  const rows = [...saved, ...drafts.slice(0, Math.max(0, requested - saved.length))];
  let copyNumber = Math.max(0, ...copies.map((copy) => copy.copyNo));
  while (rows.length < requested) {
    copyNumber += 1;
    rows.push(normalizeFormCopy({ copyNo: copyNumber }, rows.length));
  }
  return rows;
}

export function buildCopiesPayload(values: BookFormValues) {
  return {
    ...(values.id ? { expectedCopiesRevision: values.copiesRevision } : {}),
    copies: values.copies.map((copy) => ({
      copyId: copy.copyId || copy.id || undefined,
      copyNumber: copy.copyNo,
      accessionNumber: copy.accessionNo.trim() || null,
      sectionId: copy.section,
      shelfId: copy.shelf,
    })),
  };
}

export function buildGeneralPayload(values: BookFormValues) {
  return {
    ...(values.id ? { expectedMetadataRevision: values.metadataRevision } : {}),
    title: values.title.trim(),
    isbn: values.isbn.trim() || null,
    author: values.author.trim(),
    publisher: values.publisher,
    edition: values.edition,
    subject: values.subject,
    categoryId: values.categoryId,
    language: values.language,
    languageCode: catalogueLanguageCode(values),
    materialCode: values.materialCode ?? null,
    ...(values.expectedCatalogueConfigurationRevision != null
      ? { expectedCatalogueConfigurationRevision: values.expectedCatalogueConfigurationRevision }
      : {}),
    applicableAge: values.applicableAge,
    price: null,
    priceText: values.price === '' ? null : values.price,
    pages: Number(values.numberOfPages),
    numberOfCopies: values.copies.filter((copy) => copy.copyId || copy.id).length,
    coverImage: values.coverImage || null,
  };
}

// Keep pending copy edits dirty when only the general metadata has been saved.
export function generalBaseline(values: BookFormValues, original: BookFormValues): BookFormValues {
  return { ...values, copies: original.copies, numberOfCopies: original.numberOfCopies };
}
