import { useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Card,
  Stack,
  Button,
  Switch,
  IconButton,
  Typography,
  FormControlLabel,
} from '@mui/material';

import {
  branchKey,
  branchLabel,
  canManageGrant,
  permissionLabel,
  inheritedSources,
} from './permission-catalogue';

import type { GrantProvider, PermissionBranch, CataloguePermission } from './permission-catalogue';

type Props = {
  node: PermissionBranch;
  provider: GrantProvider;
  grants: Record<string, boolean>;
  subtreeEntries: Map<string, CataloguePermission[]>;
  onToggle: (name: string, granted: boolean) => void;
  onBulk: (name: string, granted: boolean) => void;
  disabled?: boolean;
  depth?: number;
};

export default function PermissionNode({
  node,
  provider,
  grants,
  subtreeEntries,
  onToggle,
  onBulk,
  disabled = false,
  depth = 0,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const branches = node.children.filter((child) => child.children.length > 0);
  const actions = [
    ...(node.permission ? [node.permission] : []),
    ...node.children
      .filter((child) => child.children.length === 0)
      .map((child) => child.permission)
      .filter((entry): entry is CataloguePermission => !!entry),
  ];
  const prefix = actions[0]?.name.split('.').slice(0, -1) ?? [];
  while (prefix.length && !actions.every((entry) => entry.name.startsWith(`${prefix.join('.')  }.`))) prefix.pop();
  const actionContext = node.permission?.name ?? prefix.join('.');
  const eligible = (subtreeEntries.get(branchKey(node)) ?? []).filter((entry) =>
    canManageGrant(entry, provider)
  );
  const allSelected = eligible.length > 0 && eligible.every((entry) => grants[entry.name]);
  const inheritedCount = eligible.filter(
    (entry) => inheritedSources(entry, provider).length > 0
  ).length;
  return (
    <Box sx={{ pl: { xs: 0, md: Math.min(depth, 3) * 2 }, mb: 1, minWidth: 0 }}>
      <Card
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 1.5,
          borderColor: allSelected ? 'primary.main' : 'divider',
          bgcolor: allSelected
            ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04)
            : 'background.paper',
        }}
      >
        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
          {branches.length > 0 && (
            <IconButton
              aria-label={`${expanded ? 'Collapse' : 'Expand'} ${branchLabel(node)}`}
              aria-expanded={expanded}
              onClick={() => setExpanded(!expanded)}
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              <Iconify
                icon={expanded ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
                width={16}
              />
            </IconButton>
          )}
          <Typography
            variant="subtitle2"
            sx={{ flex: 1, overflowWrap: 'anywhere', fontWeight: 600 }}
          >
            {branchLabel(node)}
          </Typography>
          <Button
            size="small"
            disabled={disabled || eligible.length === 0}
            color={allSelected ? 'error' : 'primary'}
            onClick={() => onBulk(branchKey(node), !allSelected)}
            sx={{ minHeight: 44, minWidth: 44 }}
          >
            {allSelected
              ? provider.providerName === 'U'
                ? 'Remove direct grants'
                : 'Revoke All'
              : 'Grant All'}{' '}
            ({eligible.length})
          </Button>
        </Stack>
        <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
          {actions.map((entry) => {
            const inherited = inheritedSources(entry, provider);
            const eligibleProvider = canManageGrant(entry, provider);
            return (
              <Box
                key={entry.name}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  border: '1px solid',
                  maxWidth: '100%',
                  borderColor: grants[entry.name] ? 'primary.main' : 'divider',
                }}
              >
                <FormControlLabel
                  sx={{ m: 0, minHeight: 44, gap: 1, maxWidth: '100%' }}
                  label={
                    <Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>
                      {permissionLabel(entry, actionContext)}
                    </Typography>
                  }
                  labelPlacement="start"
                  control={
                    <Switch
                      size="small"
                      checked={!!grants[entry.name]}
                      disabled={disabled || !eligibleProvider}
                      onChange={(_, value) => onToggle(entry.name, value)}
                      slotProps={{
                        input: {
                          'aria-label': `${branchLabel(node)}: ${permissionLabel(entry, actionContext)}`,
                        },
                      }}
                      sx={{ minWidth: 44, minHeight: 44, flexShrink: 0 }}
                    />
                  }
                />
                {inherited.length > 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', maxWidth: 260 }}
                  >
                    Inherited from{' '}
                    {inherited
                      .map(
                        (source) =>
                          `${source.providerName === 'R' ? 'role' : source.providerName} ${source.providerKey}`
                      )
                      .join(', ')}
                    . Remains effective.
                  </Typography>
                )}
                {!eligibleProvider && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Managed through {entry.allowedProviders.join(', ')} only.
                  </Typography>
                )}
              </Box>
            );
          })}
        </Stack>
        {inheritedCount > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Removing direct grants does not remove the {inheritedCount} inherited permission(s).
          </Typography>
        )}
      </Card>
      {expanded &&
        branches.map((child) => (
          <PermissionNode
            key={branchKey(child)}
            node={child}
            provider={provider}
            grants={grants}
            subtreeEntries={subtreeEntries}
            onToggle={onToggle}
            onBulk={onBulk}
            disabled={disabled}
            depth={depth + 1}
          />
        ))}
    </Box>
  );
}
