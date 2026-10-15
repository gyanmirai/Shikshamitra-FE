import type { IParams } from 'src/components/customizabaleTable/types';

import { parseTableDate } from 'src/components/customizabaleTable/utils';

export function serializeChargeTableFilters(filters: IParams['filters']) {
  if (!filters.length) return undefined;
  return JSON.stringify(
    filters.map(({ column, type, value, valueType }) => ({
      column,
      type,
      value:
        valueType === 'date'
          ? parseTableDate(value)?.startOf('day').format('YYYY-MM-DDTHH:mm:ssZ')
          : value,
    }))
  );
}
