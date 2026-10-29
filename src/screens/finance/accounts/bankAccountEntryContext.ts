import { financePaths } from 'src/constants/finance-menu';

/** Return navigation is restricted to the owning local bank workspace. */
export function bankAccountReturnTo(value: string | null | undefined): string | null {
  if (
    !value ||
    value.length > 4000 ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\r\n]/.test(value)
  )
    return null;
  try {
    const url = new URL(value, 'https://school.invalid');
    if (
      url.origin !== 'https://school.invalid' ||
      url.pathname !== financePaths.accounts.settings.bankAccounts ||
      !url.searchParams.get('bankActivity')
    )
      return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function readBankAccountEntryContext(
  params: Pick<URLSearchParams, 'get'>,
  academicYearId: string,
  action: 'add' | 'deposit'
): { bankAccountId: string; returnTo: string } | null {
  const bankAccountId = params.get('bankAccountId');
  const returnTo = bankAccountReturnTo(params.get('returnTo'));
  if (
    params.get('action') !== action ||
    params.get('academicYearId') !== academicYearId ||
    !bankAccountId ||
    bankAccountId.length > 100 ||
    !/^[\w-]+$/.test(bankAccountId) ||
    !returnTo
  )
    return null;
  return { bankAccountId, returnTo };
}
