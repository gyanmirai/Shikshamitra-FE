import * as Yup from 'yup';

export type BorrowingRuleDto = {
  role: string | number;
  maxBooksAtTime?: number | null;
  reservationLimit?: number | null;
};
export type BorrowingRuleDraft = {
  role: 0 | 1;
  name: 'Student' | 'Staff';
  maxBooksAtTime: string;
  reservationLimit: string;
};
export type BorrowingRulesValues = { rules: BorrowingRuleDraft[] };

export function createBorrowingRulesDraft(items: BorrowingRuleDto[] = []): BorrowingRulesValues {
  return {
    rules: (
      [
        { role: 0, name: 'Student' },
        { role: 1, name: 'Staff' },
      ] as const
    ).map((identity) => {
      const saved = items.find(
        (item) =>
          item.role === identity.role ||
          String(item.role).toLowerCase() === identity.name.toLowerCase()
      );
      return {
        ...identity,
        maxBooksAtTime: saved?.maxBooksAtTime == null ? '' : String(saved.maxBooksAtTime),
        reservationLimit: saved?.reservationLimit == null ? '' : String(saved.reservationLimit),
      };
    }),
  };
}

const limitSchema = Yup.string()
  .required('Enter a limit. Use 0 to prevent borrowing or reservations.')
  .test('whole-number', 'Enter a whole number from 0 to 99.', (value) =>
    /^\d{1,2}$/.test(value || '')
  );

export const borrowingRulesSchema = Yup.object({
  rules: Yup.array()
    .of(
      Yup.object({
        maxBooksAtTime: limitSchema,
        reservationLimit: limitSchema,
      })
    )
    .required(),
});

export function buildBorrowingRulesPayload(values: BorrowingRulesValues) {
  borrowingRulesSchema.validateSync(values, { abortEarly: false });
  return {
    rules: values.rules.map((rule) => ({
      role: rule.role,
      maxBooksAtTime: Number(rule.maxBooksAtTime),
      reservationLimit: Number(rule.reservationLimit),
    })),
  };
}
