import type { IParams } from 'src/components/customizabaleTable/types';

import { it, expect } from 'vitest';

import { concessionFilterArgs, normalizeConcessionFilters } from './concessionTableQuery';

const filter = (
  column: string,
  type: string,
  value: unknown,
  valueType: string
): IParams['filters'][number] => ({ column, type, value, valueType });

it('maps each concession column filter to the paginated API query', () => {
  const filters = [
    filter('policyName', 'startsWith', 'Merit', 'string'),
    filter('valueSource', 'equals', 'PolicyFixed', 'enum'),
    filter('calculationMethod', 'equals', 'Percentage', 'enum'),
    filter('policyLimit', 'between', { min: 10, max: 50 }, 'number'),
    filter('applyOn', 'equals', 'AllOutstanding', 'enum'),
    filter('updatedAt', 'before', '07-10-2026', 'date'),
  ];

  expect(concessionFilterArgs(filters)).toEqual({
    policyNameFilter: 'Merit',
    policyNameOperator: 'startsWith',
    valueSource: 'PolicyFixed',
    calculationMethod: 'Percentage',
    applyOn: 'AllOutstanding',
    limitOperator: 'between',
    limitValue: 10,
    limitMax: 50,
    updatedAtOperator: 'before',
    updatedAt: new Date(2026, 9, 7).toISOString(),
    updatedAtEnd: new Date(2026, 9, 8).toISOString(),
  });
});

it('keeps the newest filter chip for a column so the visible rule matches the request', () => {
  const filters = [
    filter('applyOn', 'equals', 'AllFees', 'enum'),
    filter('status', 'equals', 'Active', 'enum'),
    filter('applyOn', 'equals', 'FutureInstallments', 'enum'),
  ];

  expect(normalizeConcessionFilters(filters)).toEqual([filters[1], filters[2]]);
  expect(concessionFilterArgs(normalizeConcessionFilters(filters)).applyOn).toBe(
    'FutureInstallments'
  );
});
