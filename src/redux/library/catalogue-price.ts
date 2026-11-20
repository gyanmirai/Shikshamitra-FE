import { formatNumber } from 'src/utils/formate_number';

type CataloguePriceSource = {
  price?: number | null;
  priceText?: string | null;
};

export function cataloguePriceDraft(source?: CataloguePriceSource | null): string {
  if (source?.priceText !== undefined) return source.priceText ?? '';
  return source?.price == null ? '' : String(source.price);
}

export function isCataloguePriceDraftValid(value: unknown): value is string {
  if (value === '') return true;
  if (typeof value !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(value)) return false;
  return value.split('.')[0].replace(/^0+/, '').length <= 16;
}

export function isNegativeCataloguePrice(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.startsWith('-') &&
    value.length > 1 &&
    isCataloguePriceDraftValid(value.slice(1))
  );
}

export function cataloguePriceLabel(source?: CataloguePriceSource | null): string {
  const value = cataloguePriceDraft(source);
  if (value === '') return 'Unknown';
  if (!isCataloguePriceDraftValid(value) && !isNegativeCataloguePrice(value)) return 'Unavailable';
  return formatNumber(value, undefined, { fractionDigits: 2 });
}
