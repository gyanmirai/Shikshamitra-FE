import type { IParams } from 'src/components/customizabaleTable/types';

const textColumns = ['roomName', 'buildingName', 'floorName', 'roomTypeName', 'features'] as const;
const numberColumns = ['capacity', 'totalBenches'] as const;
const textOperators = ['contains', 'equals', 'startsWith', 'endsWith'] as const;
const numberOperators = ['equals', 'greaterThan', 'lessThan', 'between'] as const;

type RoomFilterColumn = (typeof textColumns)[number] | (typeof numberColumns)[number];
type RoomFilterOperator = (typeof textOperators)[number] | (typeof numberOperators)[number];
type RoomFilterValue = string | number | { min: number; max: number };
type RoomColumnFilter = {
  column: RoomFilterColumn;
  type: RoomFilterOperator;
  value: RoomFilterValue;
};

function finiteNumber(value: unknown) {
  if (
    (typeof value !== 'number' && typeof value !== 'string') ||
    value === '' ||
    !Number.isFinite(Number(value))
  ) {
    throw new Error('Enter a valid number for the room filter.');
  }
  return Number(value);
}

export function roomServerFilters(filters: IParams['filters']): RoomColumnFilter[] {
  if (filters.length > 10) throw new Error('Use at most 10 room column filters.');
  return filters.map(({ column, type, value: raw }) => {
    let value: RoomFilterValue;
    if ((numberColumns as readonly string[]).includes(column)) {
      if (!(numberOperators as readonly string[]).includes(type))
        throw new Error('This numeric room filter is not supported.');
      const input: unknown = raw;
      if (type === 'between') {
        if (!input || typeof input !== 'object' || !('min' in input) || !('max' in input))
          throw new Error('Enter both room filter limits.');
        value = { min: finiteNumber(input.min), max: finiteNumber(input.max) };
        if (value.min > value.max)
          throw new Error('The minimum room filter value cannot exceed the maximum.');
      } else value = finiteNumber(input);
    } else {
      if (
        !(textColumns as readonly string[]).includes(column) ||
        !(textOperators as readonly string[]).includes(type)
      )
        throw new Error('This room column filter is not supported.');
      if (typeof raw !== 'string' || raw.length > 200)
        throw new Error('Room filter text must contain at most 200 characters.');
      value = raw;
    }
    return { column: column as RoomFilterColumn, type: type as RoomFilterOperator, value };
  });
}
