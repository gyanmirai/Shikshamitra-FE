import * as yup from 'yup';
import {
  isNegativeCataloguePrice,
  isCataloguePriceDraftValid,
} from 'src/redux/library/catalogue-price';

export function cataloguePriceSchema(persisted?: { bookId?: string; price?: string }) {
  return yup
    .string()
    .strict()
    .optional()
    .test(
      'exact-price',
      'New or changed prices must be nonnegative, with up to 16 whole digits and 2 decimal places. Leave it blank for Unknown.',
      function (value) {
        if (value === undefined || isCataloguePriceDraftValid(value)) return true;
        return Boolean(
          persisted?.bookId &&
          this.parent.id === persisted.bookId &&
          value === persisted.price &&
          isNegativeCataloguePrice(value)
        );
      }
    );
}
