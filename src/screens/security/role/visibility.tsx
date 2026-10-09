import { useMemo, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { fullSecurityNavData } from 'src/layouts/config-nav-dashboard';

import VisibilityDetails from './visibility-details';
import { setPermissionGrants } from './permission-grants';
import VisibilityModuleCard from './visibility-module-card';
import { useUserPermissionOverrides } from './user-permission-context';
import { buildVisibilityPanels, isVisibilityPermission } from './permission-catalogue';
import { groupGrantState, effectivePermissionGrants } from './effective-permission-grants';

import type { PermissionGrant } from './permission-grants';
import type { InheritedGrants } from './effective-permission-grants';

export default function Visibility({
  visibility,
  setVisibility,
  inherited = new Map(),
  manageableNames,
  disabled = false,
}: {
  visibility: PermissionGrant[];
  setVisibility: (visibility: PermissionGrant[]) => void;
  inherited?: InheritedGrants;
  manageableNames?: Set<string>;
  disabled?: boolean;
}) {
  const [selectedTitle, setSelectedTitle] = useState('');
  const overrides = useUserPermissionOverrides();
  /** Memoization Justification: the static navigation tree constructs icon elements;
   * retaining its reference avoids rebuilding the complete tree on every grant edit. */
  const navigation = useMemo(() => fullSecurityNavData().flatMap((item) => item.items), []);
  const data = buildVisibilityPanels(visibility, navigation);
  const current = data.find((item) => item.title === selectedTitle);
  const effective = effectivePermissionGrants(visibility, inherited);
  const stateFor = (name: string) => groupGrantState([name], visibility, inherited);
  const canManage = (name: string) =>
    !!name &&
    isVisibilityPermission(name) &&
    !disabled &&
    (!manageableNames || manageableNames.has(name)) &&
    (!!overrides || !stateFor(name).inheritedOnly);
  const toggle = (name: string) => {
    if (!canManage(name)) return;
    const direct = visibility.find((grant) => grant.name === name)?.isGranted;
    setVisibility(setPermissionGrants(visibility, [name], !direct));
  };
  const currentNames = current?.submodule.map((item) => item.permissionName) ?? [];
  const editableNames = currentNames.filter(canManage);
  const bulkState = groupGrantState(currentNames, visibility, inherited);
  const toggleAll = () => {
    if (!editableNames.length) return;
    setVisibility(setPermissionGrants(visibility, editableNames, !bulkState.checked));
  };
  return (
    <Box
      sx={{
        height: { xs: 'auto', md: '100%' },
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
        minHeight: 0,
        p: 1,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          height: { xs: 280, md: '100%' },
          width: { xs: '100%', md: 340 },
          flexShrink: 0,
          minHeight: { xs: 240, md: 0 },
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2.5, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Modules
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Manage visibility & permissions
          </Typography>
        </Box>
        <Scrollbar sx={{ px: 2, pb: 2 }}>
          <Stack spacing={1.5} sx={{ pb: 8 }}>
            {data.map((item) => (
              <VisibilityModuleCard
                key={item.title}
                item={item}
                selected={current?.title === item.title}
                state={stateFor(item.permissionName)}
                disabled={!canManage(item.permissionName)}
                visibleCount={
                  item.submodule.filter((sub) =>
                    effective.some((grant) => grant.name === sub.permissionName && grant.isGranted)
                  ).length
                }
                onSelect={() => setSelectedTitle(item.title)}
                onToggle={() => toggle(item.permissionName)}
              />
            ))}
          </Stack>
        </Scrollbar>
      </Paper>
      <VisibilityDetails current={current} stateFor={stateFor} canManage={canManage} toggle={toggle}
        editableNames={editableNames}
        toggleAll={toggleAll} allChecked={bulkState.checked} bulkDisabled={!editableNames.length} />
    </Box>
  );
}
