import { BankAccountType } from '../BankAccManagement/Components/type';

export interface AccountSettingHistoryItem {
  id: string;
  versionNumber: number;
  changeAction: string;
  changeTime?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  changedFields?: {
    fieldName: string;
    originalValue?: string | null;
    newValue?: string | null;
  }[];
}

export function formatHistoryAction(action: string) {
  const labels: Record<string, string> = {
    created: 'Created',
    updated: 'Updated',
    deleted: 'Deleted',
    unavailable: 'Historical version',
  };
  return labels[action] || 'Change recorded';
}

export function formatHistoryField(field: string) {
  const labels: Record<string, string> = {
    IsActive: 'Status',
    IfscCode: 'IFSC code',
    MicrCode: 'MICR code',
    UpiId: 'UPI ID',
  };
  return labels[field] || field.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

export function formatHistoryValue(value: string | null | undefined, field: string): string {
  if (value == null || value === '') return 'Not set';
  let parsed: unknown = value;
  try {
    parsed = JSON.parse(value);
  } catch {
    // Older audit entries may already contain plain text.
  }
  if (parsed == null || parsed === '') return 'Not set';
  if (field.toLowerCase() === 'accountnumber') {
    const account = typeof parsed === 'string' ? parsed : value;
    return account.length > 4 ? `•••• ${account.slice(-4)}` : '••••';
  }
  if (typeof parsed === 'boolean') {
    if (field === 'IsActive') return parsed ? 'Active' : 'Inactive';
    return parsed ? 'Yes' : 'No';
  }
  if (field === 'AccountType') {
    if (parsed === BankAccountType.Saving || parsed === 'Saving') return 'Saving';
    if (parsed === BankAccountType.Current || parsed === 'Current') return 'Current';
  }
  if (Array.isArray(parsed)) return parsed.length ? parsed.map(String).join(', ') : 'Not set';
  if (typeof parsed === 'object') return JSON.stringify(parsed);
  return String(parsed);
}
