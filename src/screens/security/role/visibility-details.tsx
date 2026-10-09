import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Paper, Stack, Switch, Typography } from '@mui/material';

import UserPermissionControl from './user-permission-control';
import VisibilitySubmoduleItem from './visibility-submodule-item';
import { useUserPermissionOverrides } from './user-permission-context';

import type { VisibilityPanel } from './permission-catalogue';
import type { groupGrantState } from './effective-permission-grants';

export default function VisibilityDetails({ current, stateFor, canManage, toggle, toggleAll, allChecked, bulkDisabled, editableNames }: {
  current?: VisibilityPanel;
  stateFor: (name: string) => ReturnType<typeof groupGrantState>;
  canManage: (name: string) => boolean;
  toggle: (name: string) => void;
  toggleAll: () => void;
  allChecked: boolean;
  bulkDisabled: boolean;
  editableNames: string[];
}) {
  const overrides = useUserPermissionOverrides();
  return (
    <Paper variant="outlined" sx={{ flexGrow: 1, minWidth: 0, minHeight: { xs: 280, md: 0 },
      height: { xs: 450, md: '100%' }, borderRadius: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {!current ? <EmptyContent title="Select a module" description="Choose a module from the sidebar to manage its visibility settings."
        imgUrl="/assets/icons/empty/ic-content.svg" /> : <>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            <Box><Typography variant="h6">{current.title}</Typography>
              <Typography variant="body2" color="text.secondary">Manage sub-module access</Typography></Box>
            {current.submodule.length > 0 && (overrides
              ? <UserPermissionControl names={editableNames} label="All sub-modules" ariaLabel={`All ${current.title} submodule visibility`} disabled={bulkDisabled} />
              : <Box component="label" sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle2">Select All</Typography>
              <Switch checked={allChecked} disabled={bulkDisabled} onChange={toggleAll}
                slotProps={{ input: { 'aria-label': `Select all ${current.title} submodule visibility` } }}
                sx={{ minWidth: 44, minHeight: 44 }} />
            </Box>)}
          </Stack>
        </Box>
        <Scrollbar sx={{ flexGrow: 1, p: 3 }}><Stack spacing={1} sx={{ pb: 8 }}>
          {current.submodule.map((sub) => <VisibilitySubmoduleItem key={sub.permissionName} title={sub.title}
            name={sub.permissionName}
            state={stateFor(sub.permissionName)} disabled={!canManage(sub.permissionName)} onToggle={() => toggle(sub.permissionName)} />)}
        </Stack></Scrollbar>
      </>}
    </Paper>
  );
}
