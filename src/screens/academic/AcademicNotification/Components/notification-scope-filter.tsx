import CustomSelect from 'src/components/custom-select';

import { NotificationFilterRow } from './notification-filter-row';
import { notificationCategories, notificationRuleStatuses } from '../use-notification-workspace-state';

import type { NotificationScopeOption } from '../notification-scope-options';

interface Props {
  category: string;
  status: string;
  scopeKey: string;
  scopes: NotificationScopeOption[];
  disabled?: boolean;
  onChange: (value: Partial<Record<'category' | 'status' | 'scope', string>>) => void;
}

export function NotificationScopeFilter({ category, status, scopeKey, scopes, disabled, onChange }: Props) {
  return (
    <NotificationFilterRow>
      <CustomSelect
        label="Category"
        options={notificationCategories.map(({ value, label }) => ({ value, label }))}
        value={category}
        size="small"
        disabled={disabled}
        onChange={(value) => onChange({ category: String(value) })}
      />
      {!!scopes.length && (
        <CustomSelect
          label="Rule scope"
          options={scopes.map(({ value, label }) => ({ value, label }))}
          value={scopeKey}
          size="small"
          isSearch
          disabled={disabled}
          onChange={(value) => onChange({ scope: String(value) })}
        />
      )}
      <CustomSelect
        label="Rule status"
        options={notificationRuleStatuses}
        value={status}
        size="small"
        disabled={disabled}
        onChange={(value) => onChange({ status: String(value) })}
      />
    </NotificationFilterRow>
  );
}
