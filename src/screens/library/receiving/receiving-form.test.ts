import dayjs from 'dayjs';
import { it, expect } from 'vitest';

import {
  buildReceivingInput,
  createReceivingValues,
  validateReceivingValues,
} from './receiving-form';

function validDraft() {
  const draft = createReceivingValues();
  draft.receivedOn = dayjs('2026-11-18');
  draft.source = 1;
  draft.lines[0] = {
    ...draft.lines[0],
    book: { id: 'book-id', title: 'Stories' },
    sectionId: 'section-id',
    shelfId: 'shelf-id',
    quantity: '2',
  };
  return draft;
}

it('preserves an exact large supported cost string and date-only school receipt date', async () => {
  const draft = validDraft();
  Object.assign(draft.lines[0], {
    costKnown: true,
    unitCost: '9999999999999998.99',
    currency: 'INR',
  });
  await validateReceivingValues(draft);
  expect(buildReceivingInput(draft)).toMatchObject({
    receivedOn: '2026-11-18',
    source: 1,
    lines: [{ quantity: 2, unitCost: '9999999999999998.99', currency: 'INR' }],
  });
});

it('keeps unknown acquisition cost separate from explicitly evidenced zero', async () => {
  const unknown = validDraft();
  Object.assign(unknown.lines[0].book!, { price: 350 });
  await validateReceivingValues(unknown);
  expect(buildReceivingInput(unknown).lines[0]).toMatchObject({ unitCost: null, currency: null });
  const zero = validDraft();
  Object.assign(zero.lines[0], { costKnown: true, unitCost: '0.00', currency: 'INR' });
  await validateReceivingValues(zero);
  expect(buildReceivingInput(zero).lines[0]).toMatchObject({ unitCost: '0.00', currency: 'INR' });
});

it('starts with no browser-derived school date or invented stock source', () => {
  expect(createReceivingValues()).toMatchObject({ receivedOn: null, source: null });
});

it.each([
  [
    'receivedOn',
    (draft: ReturnType<typeof validDraft>) => {
      draft.receivedOn = null;
    },
  ],
  [
    'lines[0].currency',
    (draft: ReturnType<typeof validDraft>) => {
      Object.assign(draft.lines[0], { costKnown: true, unitCost: '12.50', currency: 'inr' });
    },
  ],
  [
    'lines[0].unitCost',
    (draft: ReturnType<typeof validDraft>) => {
      Object.assign(draft.lines[0], {
        costKnown: true,
        unitCost: '10000000000000000.00',
        currency: 'INR',
      });
    },
  ],
] as const)('validates %s without coercing monetary text', async (path, change) => {
  const draft = validDraft();
  change(draft);
  await expect(validateReceivingValues(draft)).rejects.toMatchObject({ path });
});
