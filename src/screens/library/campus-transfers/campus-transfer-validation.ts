import * as Yup from 'yup';
import { parseDateOnly } from 'src/utils/date-only';

const schoolDate = (required: string, invalid: string) =>
  Yup.string()
    .required(required)
    .test('school-date', invalid, (value) => Boolean(parseDateOnly(value)));

export const dispatchSchema = Yup.object({
  sourceSectionId: Yup.string().required('Choose a source section.'),
  destinationSectionId: Yup.string().required('Choose a destination section.'),
  destinationShelfId: Yup.string().required('Choose a destination shelf.'),
  dispatchedOn: schoolDate('Enter the dispatch date.', 'Enter a valid dispatch date.'),
  reason: Yup.string()
    .trim()
    .required('Enter the transfer reason.')
    .max(500, 'Use up to 500 characters.'),
  copies: Yup.array()
    .min(1, 'Choose at least one physical copy.')
    .max(100, 'Choose up to 100 copies.'),
});

export const receiptSchema = (dispatchedOn: string) =>
  Yup.object({
    receivedOn: schoolDate('Enter the received date.', 'Enter a valid received date.').test(
      'date-order',
      'Receive on or after the dispatch date.',
      (value) => !value || value >= dispatchedOn
    ),
    notes: Yup.string().trim().max(500, 'Use up to 500 characters.'),
    selected: Yup.object().test(
      'selected-copies',
      'Select at least one copy physically received.',
      (value) =>
        Boolean(
          value &&
          Object.values(value).length &&
          Object.values(value).every((condition) => [0, 4, 5].includes(Number(condition)))
        )
    ),
  });
