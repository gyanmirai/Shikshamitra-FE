import { it, expect } from 'vitest';
import {
  catalogueBook,
  catalogueDefaults,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-data';

import { createCatalogueBookSchemas } from './catalogue-book-schema';

const schema = createCatalogueBookSchemas(catalogueDefaults)[0];

it.each(['', '0', '40.25', '9999999999999999.99'])(
  'accepts unknown or exact nonnegative catalogue price %j without rounding',
  async (price) => {
    await expect(schema.validateAt('price', { ...catalogueBook(), price })).resolves.toBe(price);
  }
);

it.each(['-1', '1.001', '10000000000000000.00', '1e3', '1,000', '₹10', ' 1.00', '1.00 ', 'NaN'])(
  'rejects malformed, subcent or overflowing catalogue price %j',
  async (price) => {
    await expect(schema.validateAt('price', { ...catalogueBook(), price })).rejects.toBeDefined();
  }
);
