import type { ReactNode } from 'react';
import type {
  BankActivityQuery,
  BankActivitySource,
} from 'src/redux/finance/BankAccountManage/bankAccountActivityApi';

import { GlobalIcons } from 'src/utils/icons';
import { DetailField } from 'src/components/detail-view';
import { FormSectionCard } from 'src/components/form-section-card';

export const sourceLabels: Record<BankActivitySource, string> = {
  income: 'Income',
  expense: 'Expense',
  collection: 'Collection',
  refund: 'Refund',
  'cash-deposit': 'Cash deposit',
};
export const recognitionLabels = ['Recorded', 'Pending', 'Reversed', 'Unverified'];
export const confirmationLabels = ['Unavailable', 'Credit confirmed', 'In transit'];
export function ActivitySection({
  title,
  help,
  children,
  icon = GlobalIcons.bankAccount,
}: {
  title: string;
  help: string;
  children: ReactNode;
  icon?: string;
}) {
  return (
    <FormSectionCard
      title={title}
      icon={icon}
      descriptionTooltip={help}
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      sx={{ minWidth: 0, containerType: 'inline-size', boxShadow: 'none' }}
    >
      {children}
    </FormSectionCard>
  );
}
export function ActivityField({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <DetailField
      label={label}
      value={value}
      labelTypographyProps={{
        color: 'text.secondary',
        sx: { fontWeight: 'fontWeightRegular', textTransform: 'none', letterSpacing: 'normal' },
      }}
    />
  );
}
export function activityReturnUrl(bankAccountId: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('bankActivity', bankAccountId);
  return `${url.pathname}${url.search}`;
}
export function activityEntryUrl(
  path: string,
  bankAccountId: string,
  academicYearId: string,
  action: 'add' | 'deposit'
) {
  const params = new URLSearchParams({
    bankAccountId,
    academicYearId,
    action,
    returnTo: activityReturnUrl(bankAccountId),
  });
  return `${path}?${params}`;
}
export function readActivityQuery(
  raw: string | null,
  academicYearId: string
): Partial<BankActivityQuery> {
  try {
    const query = JSON.parse(raw || '{}');
    return query.academicYearId === academicYearId ? query : {};
  } catch {
    return {};
  }
}
export function saveActivityState(
  bankAccountId: string,
  query: BankActivityQuery,
  tab: string,
  debitQuery?: BankActivityQuery,
  creditQuery?: BankActivityQuery
) {
  const url = new URL(window.location.href);
  url.searchParams.set('bankActivity', bankAccountId);
  url.searchParams.set('bankActivityQuery', JSON.stringify(query));
  url.searchParams.set('bankActivityTab', tab);
  if (debitQuery) url.searchParams.set('bankDebitQuery', JSON.stringify(debitQuery));
  if (creditQuery) url.searchParams.set('bankCreditQuery', JSON.stringify(creditQuery));
  url.searchParams.delete('bankDepositQuery');
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`);
}
export function downloadActivityBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
