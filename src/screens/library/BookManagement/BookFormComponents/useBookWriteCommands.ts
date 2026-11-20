import type { CatalogueMutationResult } from 'src/redux/library/catalogue-revisions';

import { requireCatalogueRevision } from 'src/redux/library/catalogue-revisions';
import {
  useAddBookMutation,
  useUpdateBookMutation,
  useUpdateBookCopiesMutation,
} from 'src/redux/library/bookList/bookList-api';

import { buildCopiesPayload, buildGeneralPayload } from './book-form-model';

import type { BookFormValues } from '../Components/type';

export function useBookWriteCommands() {
  const [add] = useAddBookMutation();
  const [update] = useUpdateBookMutation();
  const [copies] = useUpdateBookCopiesMutation();
  return {
    create: (values: BookFormValues, academicYearId: string): Promise<CatalogueMutationResult> =>
      add({
        academicYearId,
        body: {
          ...buildGeneralPayload(values),
          ...buildCopiesPayload(values),
          numberOfCopies: values.copies.length,
        },
      }).unwrap(),
    metadata: (values: BookFormValues): Promise<CatalogueMutationResult> => {
      requireCatalogueRevision(values.metadataRevision);
      return update({ bookId: values.id, body: buildGeneralPayload(values) }).unwrap();
    },
    copies: (values: BookFormValues): Promise<CatalogueMutationResult> => {
      requireCatalogueRevision(values.copiesRevision);
      return copies({ bookId: values.id, body: buildCopiesPayload(values) }).unwrap();
    },
  };
}
