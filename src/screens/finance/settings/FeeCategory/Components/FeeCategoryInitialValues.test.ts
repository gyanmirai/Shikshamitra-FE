import { it, expect, describe } from 'vitest';
import { FeeHeadModule } from 'src/redux/feeHeadModule/feeHeadModuleApi';

import { getFeeCategoryInitialValues } from './FeeCategoryInitialValues';

describe('getFeeCategoryInitialValues', () => {
  it('preserves a numeric module value for the update dropdown', () => {
    const values = getFeeCategoryInitialValues({
      name: 'Library Fees',
      description: 'desc',
      feeHeads: [
        {
          id: 'fee-head-id',
          incomeCategoryId: 'income-category-id',
          name: 'Library Fees',
          module: FeeHeadModule.Library,
          description: '',
          isConcessionApplied: false,
        },
      ],
    } as never);

    expect(values.feeHeads[0].module).toBe(8);
    expect(values.feeHeads[0].incomeCategoryId).toBe('income-category-id');
  });

  it('preserves zero instead of treating it as an empty selection', () => {
    const values = getFeeCategoryInitialValues({
      feeHeads: [{ module: FeeHeadModule.Dashboard }],
    } as never);

    expect(values.feeHeads[0].module).toBe(0);
  });
});
