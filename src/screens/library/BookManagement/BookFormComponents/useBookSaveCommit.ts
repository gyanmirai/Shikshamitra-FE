import type { FormikProps } from 'formik';
import type { AppDispatch } from 'src/redux/store';

import { useDispatch } from 'react-redux';
import { booksApi } from 'src/redux/library/bookList/bookList-api';
import { readCatalogueRevisions } from 'src/redux/library/catalogue-revisions';

import { generalBaseline } from './book-form-model';
import { useBookSaveBaselines } from './useBookSaveBaselines';
import { getInitialBookData } from '../Components/BookManageInitialValues';
import { copiesFingerprint, generalFingerprint } from './book-save-fingerprints';

import type { BookSource } from './book-form-model';
import type { BookFormValues } from '../Components/type';
import type { useBookWriteCommands } from './useBookWriteCommands';

export function useBookSaveCommit(formik: FormikProps<BookFormValues>) {
  const saved = useBookSaveBaselines(formik.initialValues);
  const dispatch = useDispatch<AppDispatch>();
  const acceptMetadata = async (values: BookFormValues, response: unknown) => {
    const { metadataRevision } = readCatalogueRevisions(response);
    const next = { ...values, metadataRevision };
    saved.general = generalFingerprint(next);
    formik.resetForm({ values: generalBaseline(next, formik.initialValues) });
    await formik.setValues(next, false);
    return next;
  };
  const acceptCopies = async (values: BookFormValues, response: unknown) => {
    const { copiesRevision } = readCatalogueRevisions(response);
    const next = { ...values, copiesRevision };
    saved.copies = copiesFingerprint(next);
    await formik.setValues(next, false);
    return next;
  };
  const reload = async (bookId: string) => {
    const source = await dispatch(
      booksApi.endpoints.getBookById.initiate({ bookId }, { subscribe: false, forceRefetch: true })
    ).unwrap();
    readCatalogueRevisions(source);
    const next = {
      ...getInitialBookData(source as BookSource),
      expectedCatalogueConfigurationRevision: formik.values.expectedCatalogueConfigurationRevision,
    };
    formik.resetForm({ values: next });
    saved.general = generalFingerprint(next);
    saved.copies = copiesFingerprint(next);
  };
  const saveExisting = async (
    values: BookFormValues,
    commands: ReturnType<typeof useBookWriteCommands>
  ) => {
    let next = values;
    if (saved.general !== generalFingerprint(next))
      next = await acceptMetadata(next, await commands.metadata(next));
    if (saved.copies !== copiesFingerprint(next))
      next = await acceptCopies(next, await commands.copies(next));
    return next;
  };
  return { saved, acceptMetadata, acceptCopies, reload, saveExisting };
}
