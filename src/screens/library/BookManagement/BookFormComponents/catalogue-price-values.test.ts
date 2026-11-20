import { it, expect } from 'vitest';
import { mapBookDetailDto } from 'src/redux/library/library-adapters';
import { catalogueBook } from 'src/screens/library/settings/catalogue-configuration/catalogue-test-data';

import { buildGeneralPayload } from './book-form-model';
import { getInitialBookData } from '../Components/BookManageInitialValues';

it.each([undefined, { price: null }])(
  'keeps new or unknown catalogue price blank: %j',
  (source) => {
    expect(getInitialBookData(source).price).toBe('');
  }
);

it('preserves a real legacy zero instead of treating it as unknown', () => {
  expect(getInitialBookData({ price: 0 }).price).toBe('0');
});

it('prefers the exact server text over a lossy JSON numeric compatibility value', () => {
  const saved = mapBookDetailDto({
    price: 10000000000000000,
    priceText: '9999999999999999.99',
  });
  expect(getInitialBookData(saved).price).toBe('9999999999999999.99');
});

it('serializes explicitly cleared catalogue price as unknown without acquisition fields', () => {
  const payload = buildGeneralPayload({ ...catalogueBook(), price: '' });
  expect(payload).toMatchObject({ price: null, priceText: null });
  expect(payload).not.toHaveProperty('unitCost');
  expect(payload).not.toHaveProperty('currency');
});

it('sends exact full-range known price text without a rounded numeric duplicate', () => {
  const payload = buildGeneralPayload({ ...catalogueBook(), price: '9999999999999999.99' });
  expect(payload).toMatchObject({ price: null, priceText: '9999999999999999.99' });
  expect(payload).not.toHaveProperty('unitCost');
  expect(payload).not.toHaveProperty('currency');
});
