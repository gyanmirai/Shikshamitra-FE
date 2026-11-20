import * as Yup from 'yup';

/** Input validation only. Finance owns calculation, rounding and allocation. */
export function financeMoneyCents(value: string): bigint | null {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  return match ? BigInt(match[1]) * BigInt(100) + BigInt((match[2] || '').padEnd(2, '0')) : null;
}

export function financeAmountInputSchema(limit: number | string | undefined, label: string) {
  return Yup.string()
    .required(`${label} is required`)
    .test(
      'money',
      'Enter a positive amount with at most two decimal places within the available balance.',
      (value) => {
        const amount = financeMoneyCents(value || '');
        const available = financeMoneyCents(String(limit ?? '0'));
        return (
          amount !== null &&
          available !== null &&
          amount > BigInt(0) &&
          amount <= available &&
          amount <= BigInt(999999900)
        );
      }
    );
}
