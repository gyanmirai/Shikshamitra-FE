'use client';

import type { RootState } from 'src/redux/store';
import type { Theme, SxProps } from '@mui/material/styles';

import { useSelector } from 'react-redux';
import { Stack, Typography } from '@mui/material';
import { hasGrantedPermission } from 'src/utils/permissions';
import { FormPrerequisiteState } from 'src/components/form-prerequisites';

import { financePrerequisiteCatalog } from './financePrerequisites';

import type { FinancePrerequisite } from './financePrerequisites';

export type { FinancePrerequisite } from './financePrerequisites';

export default function FinancePrerequisiteState({
  requirements,
  onRefresh,
  compact,
  sx,
}: {
  requirements: FinancePrerequisite[];
  onRefresh?: () => void;
  compact?: boolean;
  sx?: SxProps<Theme>;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  if (!requirements.length) return null;
  const items = requirements.map((requirement) => ({
    ...financePrerequisiteCatalog[requirement.key],
    ...requirement,
  }));
  const permittedItems = items.filter((item) =>
    item.permissions.every((name) => hasGrantedPermission(permissions, name))
  );
  const first = items[0];
  if (items.length === 1)
    return (
      <FormPrerequisiteState
        title={first.title}
        description={first.description}
        actions={
          first.permissions.every((name) => hasGrantedPermission(permissions, name))
            ? [{ label: first.actionLabel, href: first.href }]
            : []
        }
        onRefresh={onRefresh}
        compact={compact}
        sx={sx}
      />
    );
  return (
    <FormPrerequisiteState
      title="Complete setup to continue"
      description={
        <Stack spacing={1}>
          {items.map((item) => (
            <Typography key={item.key} variant="body2" color="text.secondary">
              {item.description}
            </Typography>
          ))}
          {permittedItems.length > 0 && permittedItems.length < items.length && (
            <Typography variant="body2">
              Ask your administrator to complete the remaining setup.
            </Typography>
          )}
        </Stack>
      }
      actions={permittedItems.map((item) => ({ label: item.actionLabel, href: item.href }))}
      onRefresh={onRefresh}
      compact={compact}
      sx={sx}
    />
  );
}
