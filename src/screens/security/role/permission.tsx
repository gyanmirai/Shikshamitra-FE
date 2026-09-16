'use client';

import { useMemo, useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { fullSecurityNavData } from 'src/layouts/config-nav-dashboard';
import { Box, Card, Alert, Stack, Button, TextField, Typography } from '@mui/material';

import PermissionNode from './permission-node';
import {
  branchKey,
  canManageGrant,
  hasDirectGrant,
  catalogueEntries,
  inheritedSources,
  branchPermissions,
  buildPermissionPanels,
  filterPermissionBranches,
} from './permission-catalogue';

import type {
  GrantProvider,
  PermissionBranch,
  CataloguePermission,
  PermissionCatalogue,
} from './permission-catalogue';

export default function Permission({
  catalogue,
  provider,
  grants,
  setGrants,
  disabled = false,
}: {
  catalogue: PermissionCatalogue;
  provider: GrantProvider;
  grants: Record<string, boolean>;
  setGrants: (names: string[], value: boolean) => void;
  disabled?: boolean;
}) {
  const navigation = useMemo(() => fullSecurityNavData().flatMap((group) => group.items), []);
  const modules = useMemo(
    () => buildPermissionPanels(catalogue, navigation),
    [catalogue, navigation]
  );
  const [moduleName, setModuleName] = useState('');
  const [submoduleName, setSubmoduleName] = useState('');
  const [search, setSearch] = useState('');
  const selectedModule = modules.find((module) => module.name === moduleName) ?? modules[0];
  const selectedSubmodule = selectedModule?.submodule.find((sub) => sub.name === submoduleName);
  const filteredRoots = selectedSubmodule
    ? filterPermissionBranches(selectedSubmodule.roots, search)
    : [];
  const subtreeEntries = useMemo(() => {
    const result = new Map<string, CataloguePermission[]>();
    const visit = (items: PermissionBranch[]) =>
      items.forEach((node) => {
        result.set(branchKey(node), branchPermissions([node]));
        visit(node.children);
      });
    modules.forEach((module) => module.submodule.forEach((sub) => visit(sub.roots)));
    return result;
  }, [modules]);
  const eligible = branchPermissions(selectedSubmodule?.roots ?? []).filter((entry) =>
    canManageGrant(entry, provider)
  );
  const entries = catalogueEntries(catalogue);
  const missingVisibility = [selectedModule?.visibilityName, selectedSubmodule?.visibilityName]
    .filter(Boolean)
    .some((name) => {
      const entry = entries.find((item) => item.name === name);
      return (
        entry && !hasDirectGrant(entry, provider) && inheritedSources(entry, provider).length === 0
      );
    });
  const selectionStyle = (selected: boolean) => ({
    justifyContent: 'flex-start',
    px: 2.5,
    py: 1.5,
    borderRadius: 1.5,
    minHeight: 44,
    color: selected ? 'primary.main' : 'text.secondary',
    bgcolor: selected
      ? (theme: any) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08)
      : 'transparent',
  });

  const renderModuleList = (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
        <Typography variant="h6">Modules</Typography>
        <Typography variant="body2" color="text.secondary">
          Select a module to manage
        </Typography>
      </Box>
      <Scrollbar>
        <Stack spacing={0.5} sx={{ p: 1, pb: 8 }}>
          {modules.map((module) => (
            <Button
              key={module.name}
              fullWidth
              size="large"
              startIcon={module.icon}
              onClick={() => {
                setModuleName(module.name);
                setSubmoduleName('');
                setSearch('');
              }}
              sx={selectionStyle(module.name === selectedModule?.name)}
            >
              <Typography variant="subtitle2" sx={{ flex: 1, textAlign: 'left' }}>
                {module.title}
              </Typography>
              {module.name === selectedModule?.name && (
                <Iconify icon="eva:arrow-ios-forward-fill" width={16} />
              )}
            </Button>
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
  const renderSubModules = (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
      <Box sx={{ p: 2.5, borderBottom: '1px dashed', borderColor: 'divider' }}>
        <Typography variant="h6">{selectedModule?.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {selectedModule?.submodule.length ?? 0} Sub-modules available
        </Typography>
      </Box>
      <Scrollbar>
        <Stack spacing={1} sx={{ p: 2, pb: 8 }}>
          {selectedModule?.submodule.map((sub) => (
            <Button
              key={sub.name}
              fullWidth
              size="large"
              onClick={() => {
                setSubmoduleName(sub.name);
                setSearch('');
              }}
              sx={selectionStyle(sub.name === submoduleName)}
            >
              <Typography variant="subtitle2" sx={{ flex: 1, textAlign: 'left' }}>
                {sub.title}
              </Typography>
              {sub.name === submoduleName && (
                <Iconify icon="eva:arrow-ios-forward-fill" width={16} />
              )}
            </Button>
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
  const renderPermissionMatrix = (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {selectedSubmodule && (
        <Box sx={{ p: 2.5, borderBottom: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="h6">Permissions</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage access &amp; security
          </Typography>
          <Stack direction="row" useFlexGap flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
            <TextField
              label="Search permissions"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              size="small"
            sx={{ flex: 1, minWidth: 160, '& .MuiInputBase-root': { minHeight: 44 } }}
            />
            <Button
              disabled={disabled || eligible.length === 0}
              onClick={() =>
                setGrants(
                  eligible.map((entry) => entry.name),
                  true
                )
              }
              sx={{ minHeight: 44 }}
            >
              Grant All ({eligible.length})
            </Button>
            <Button
              color="error"
              disabled={disabled || eligible.length === 0}
              onClick={() =>
                setGrants(
                  eligible.map((entry) => entry.name),
                  false
                )
              }
              sx={{ minHeight: 44 }}
            >
              {provider.providerName === 'U' ? 'Remove direct grants' : 'Revoke All'} (
              {eligible.length})
            </Button>
          </Stack>
          {missingVisibility && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Navigation is hidden for this role or user. You can still manage actions here. Use Set
              Module Visibility to change navigation.
            </Alert>
          )}
        </Box>
      )}
      <Scrollbar sx={{ p: 2.5 }}>
        {selectedSubmodule ? (
          <Stack spacing={1} sx={{ pb: 8 }}>
            {filteredRoots.map((node) => (
              <PermissionNode
                key={branchKey(node)}
                node={node}
                provider={provider}
                grants={grants}
                subtreeEntries={subtreeEntries}
                disabled={disabled}
                onToggle={(name, value) => setGrants([name], value)}
                onBulk={(name, value) =>
                  setGrants(
                    (subtreeEntries.get(name) ?? []).map((entry) => entry.name),
                    value
                  )
                }
              />
            ))}
            {filteredRoots.length === 0 && (
              <Typography color="text.secondary">
                {search
                  ? 'No matching permissions. Clear search to see all actions.'
                  : 'No action permissions in this section. Check the additional catalogue sections.'}
              </Typography>
            )}
          </Stack>
        ) : (
          <Box
            sx={{
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <Iconify
              icon="solar:lock-password-unlocked-bold-duotone"
              width={80}
              sx={{ color: 'primary.main', mb: 3 }}
            />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Select a Sub-module
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 300, textAlign: 'center' }}>
              Choose a sub-module from the middle panel to configure detailed permissions and
              security settings.
            </Typography>
          </Box>
        )}
      </Scrollbar>
    </Card>
  );
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ height: '100%', minHeight: 0, p: 1 }}
    >
      <Box
        sx={{
          width: { xs: '100%', md: 280 },
          flexShrink: 0,
          minHeight: { xs: 240, md: 0 },
          height: '100%',
        }}
      >
        {renderModuleList}
      </Box>
      <Box
        sx={{
          width: { xs: '100%', md: 320 },
          flexShrink: 0,
          minHeight: { xs: 240, md: 0 },
          height: '100%',
        }}
      >
        {renderSubModules}
      </Box>
      <Box sx={{ flexGrow: 1, minWidth: 0, minHeight: { xs: 400, md: 0 }, height: '100%' }}>
        {renderPermissionMatrix}
      </Box>
    </Stack>
  );
}
