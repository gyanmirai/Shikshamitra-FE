import type { Dayjs } from 'dayjs';
import type { ReceivingInput, LibraryStockSource } from 'src/redux/library/receiving-types';

import * as Yup from 'yup';
import { toDateOnly } from 'src/utils/date-only';

export type ReceivingBook = { id: string; title: string; author?: string; isbn?: string };
export type ReceivingLineDraft = {
  key: string;
  book: ReceivingBook | null;
  sectionId: string;
  shelfId: string;
  quantity: string;
  costKnown: boolean;
  unitCost: string;
  currency: string;
  manualAccessions: boolean;
  accessions: string;
};
export type ReceivingValues = {
  receivedOn: Dayjs | null;
  source: LibraryStockSource | null;
  sourceName: string;
  reference: string;
  lines: ReceivingLineDraft[];
};
export function createReceivingLine(): ReceivingLineDraft {
  return {
    key: crypto.randomUUID(),
    book: null,
    sectionId: '',
    shelfId: '',
    quantity: '',
    costKnown: false,
    unitCost: '',
    currency: '',
    manualAccessions: false,
    accessions: '',
  };
}
export function createReceivingValues(): ReceivingValues {
  return {
    receivedOn: null,
    source: null,
    sourceName: '',
    reference: '',
    lines: [createReceivingLine()],
  };
}
export function buildReceivingInput(values: ReceivingValues): ReceivingInput {
  return {
    receivedOn: toDateOnly(values.receivedOn),
    source: values.source!,
    sourceName: values.sourceName.trim() || null,
    reference: values.reference.trim() || null,
    lines: values.lines.map((line) => ({
      bookId: line.book!.id,
      sectionId: line.sectionId,
      shelfId: line.shelfId,
      quantity: Number(line.quantity),
      unitCost: line.costKnown ? line.unitCost : null,
      currency: line.costKnown ? line.currency : null,
      accessions: line.manualAccessions
        ? line.accessions.split('\n').map((value) => value.trim())
        : null,
    })),
  };
}
export function receivingFingerprint(values: ReceivingValues) {
  try {
    return JSON.stringify(buildReceivingInput(values));
  } catch {
    return '';
  }
}
export const receivingSchema = Yup.object({
  receivedOn: Yup.mixed<Dayjs>()
    .nullable()
    .required('Enter the school receipt date')
    .test('valid-school-date', 'Enter a valid receipt date', (value) => Boolean(value?.isValid())),
  source: Yup.number().nullable().oneOf([0, 1, 2, 3]).required('Select the actual stock source'),
  sourceName: Yup.string().max(256, 'Use at most 256 characters'),
  reference: Yup.string().max(256, 'Use at most 256 characters'),
  lines: Yup.array()
    .of(
      Yup.object({
        book: Yup.object({ id: Yup.string().required('Choose an existing title') })
          .nullable()
          .required('Choose an existing title'),
        sectionId: Yup.string().required('Select a section'),
        shelfId: Yup.string().required('Select a shelf in this section'),
        quantity: Yup.string()
          .required('Enter the quantity')
          .matches(/^\d+$/, 'Enter a whole quantity')
          .test(
            'quantity-range',
            'Enter between 1 and 5000 copies',
            (value) => Number(value) >= 1 && Number(value) <= 5000
          ),
        unitCost: Yup.string().when('costKnown', {
          is: true,
          then: (schema) =>
            schema
              .required('Enter the known unit cost')
              .test('exact-cost', 'Use up to 16 whole digits and 2 decimal places', (value) => {
                if (!value || !/^\d+(\.\d{1,2})?$/.test(value)) return false;
                return value.split('.')[0].replace(/^0+/, '').length <= 16;
              }),
        }),
        currency: Yup.string().when('costKnown', {
          is: true,
          then: (schema) =>
            schema
              .required('Enter the currency')
              .matches(/^[A-Z]{3}$/, 'Use a three-letter uppercase currency'),
        }),
        accessions: Yup.string().when('manualAccessions', {
          is: true,
          then: (schema) =>
            schema.test(
              'accession-count',
              'Enter one line per copy; a blank line uses automatic allocation',
              (value, context) =>
                (value || '').split('\n').length === Number(context.parent.quantity)
            ),
        }),
      })
    )
    .min(1, 'Add at least one title')
    .max(100, 'Use at most 100 receipt lines')
    .test(
      'total-quantity',
      'A receipt supports at most 5000 copies',
      (lines) => (lines || []).reduce((sum, line) => sum + Number(line.quantity || 0), 0) <= 5000
    ),
});
export async function validateReceivingValues(values: ReceivingValues): Promise<void> {
  await receivingSchema.validate(values);
}
