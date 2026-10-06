import dayjs from 'dayjs';
import { fDate, fDateTime } from 'src/utils/format-time';
import { fCurrency, fNumber } from 'src/utils/format-number';

export const policyDateLabel = (value?: string | null) =>
  value && dayjs(value).isValid() ? fDate(value) : '—';

export const policyDateTimeLabel = (value?: string | null) =>
  value && dayjs(value).isValid() ? fDateTime(value) : '—';

export const CONCESSION_VALUE_SOURCES = [
  {
    value: 'PolicyFixed',
    label: 'Fixed by policy',
    caption: 'Use the same configured value for every eligible request.',
  },
  {
    value: 'RequestEnteredWithinLimits',
    label: 'Entered in request',
    caption: 'Staff enter a value for each request, up to the policy limit.',
  },
];

export const CONCESSION_METHODS = [
  {
    value: 'Percentage',
    label: 'Percentage (%)',
    caption: 'Calculate a percentage of the eligible fee balance.',
  },
  {
    value: 'FixedAmount',
    label: 'Fixed amount (₹)',
    caption: 'Apply a rupee amount, capped at the eligible fee balance.',
  },
  {
    value: 'FullWaiver',
    label: 'Full waiver (100%)',
    caption: 'Waive the full eligible fee balance. Available for fixed policies.',
  },
];

export const CONCESSION_SCOPES = [
  {
    value: 'AllOutstanding',
    label: 'All outstanding installments',
    caption: 'Apply across all current and future unpaid installments.',
  },
  {
    value: 'CurrentInstallment',
    label: 'Current unpaid installment',
    caption: 'Apply to the earliest active unpaid installment.',
  },
  {
    value: 'FutureInstallments',
    label: 'Future installments',
    caption: 'Apply to unpaid installments after the earliest unpaid installment.',
  },
  {
    value: 'AllFees',
    label: 'All installments, including paid',
    caption: 'Approved concessions on paid amounts create separate refund requests.',
  },
];

export const concessionOptionLabel = (
  options: { value: string; label: string }[],
  value?: string
) => options.find((option) => option.value === value)?.label ?? '—';

export function concessionValueLabel(policy: {
  calculationMethod?: string;
  valueSource?: string;
  percentageValue?: number | null;
  maximumPercentage?: number | null;
  fixedAmount?: number | null;
  maximumFixedAmount?: number | null;
}) {
  if (policy.calculationMethod === 'FullWaiver') return '100%';
  const fixed = policy.valueSource === 'PolicyFixed';
  const percentage = policy.calculationMethod === 'Percentage';
  const value = percentage
    ? fixed
      ? policy.percentageValue
      : policy.maximumPercentage
    : fixed
      ? policy.fixedAmount
      : policy.maximumFixedAmount;
  if (value == null || String(value) === '' || !Number.isFinite(Number(value))) return '—';
  return percentage ? `${fNumber(value)}%` : fCurrency(value);
}
