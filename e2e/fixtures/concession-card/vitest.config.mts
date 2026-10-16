import base from '../concession-request-ui/vitest.config.mts';
export default {
  ...base,
  test: {
    ...base.test,
    include: ['src/screens/finance/ConcessionAdmin/ConcessionItemCard.test.tsx'],
  },
};
