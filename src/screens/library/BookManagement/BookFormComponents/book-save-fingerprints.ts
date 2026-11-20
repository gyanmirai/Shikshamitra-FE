import { buildCopiesPayload, buildGeneralPayload } from './book-form-model';

import type { BookFormValues } from '../Components/type';

const commandFields = [
  'expectedMetadataRevision',
  'expectedCatalogueConfigurationRevision',
  'numberOfCopies',
];

export function generalFingerprint(values: BookFormValues) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(buildGeneralPayload(values)).filter(([key]) => !commandFields.includes(key))
    )
  );
}

export const copiesFingerprint = (values: BookFormValues) =>
  JSON.stringify(buildCopiesPayload(values).copies);
