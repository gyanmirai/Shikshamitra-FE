
import { Box, Stack, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

import { notificationCategories, notificationRuleStatuses } from '../use-notification-workspace-state';

import type { NotificationScopeOption } from '../notification-scope-options';

interface Props {
  category: string;
  status: string;
  scopeKey: string;
  scopes: NotificationScopeOption[];
  contextLabel: string;
  disabled?: boolean;
  onChange: (value: Partial<Record<'category' | 'status' | 'scope', string>>) => void;
}

export function NotificationScopeFilter({ category, status, scopeKey, scopes, contextLabel, disabled, onChange }: Props) {
  return (
    <Box sx={{ px: 1, py: 1 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} gap={1}>
        <CustomSelect label="Category" options={notificationCategories.map(({ value, label }) => ({ value, label }))}
          value={category} size="small" disabled={disabled} onChange={(value) => onChange({ category: String(value) })}
          sx={{ minWidth: 170 }} />
        {!!scopes.length && (
          <CustomSelect label="Rule scope" options={scopes.map(({ value, label }) => ({ value, label }))}
            value={scopeKey} size="small" isSearch disabled={disabled} onChange={(value) => onChange({ scope: String(value) })}
            sx={{ minWidth: 170 }} />
        )}
        <CustomSelect label="Rule status" options={notificationRuleStatuses} value={status}
          size="small" disabled={disabled} onChange={(value) => onChange({ status: String(value) })}
          sx={{ minWidth: 145 }} />
        {contextLabel && (
          <Typography variant="body2" color="text.secondary">{contextLabel}</Typography>
        )}
      </Stack>
    </Box>
  );
}
