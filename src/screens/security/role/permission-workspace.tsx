'use client';

import { Box, Stack, Typography } from '@mui/material';

import PermissionMatrix from './permission-matrix';
import PermissionEmptyState from './permission-empty-state';
import { usePermissionWorkspace } from './use-permission-workspace';
import PermissionWorkspaceHeading from './permission-workspace-heading';
import PermissionWorkspaceNavigation from './permission-workspace-navigation';

import type { PermissionStates } from './permission-draft-state';
import type {
  GrantProvider,
  PermissionCatalogue,
  PermissionOverrideState,
} from './permission-catalogue';

export type PermissionWorkspaceProps = {
  catalogue: PermissionCatalogue;
  provider: GrantProvider;
  states: PermissionStates;
  setStates: (names: string[], state: PermissionOverrideState) => void;
  disabled: boolean;
  visibility?: boolean;
  subjectName?: string;
};
export default function PermissionWorkspace(props: PermissionWorkspaceProps) {
  const {
    provider,
    disabled,
    visibility = false,
    catalogue,
    states,
    setStates,
    subjectName,
  } = props;
  const {
    moduleTitle,
    submoduleTitle,
    dependencyNote,
    selected,
    navigation,
    user,
    rows,
    sources,
    change,
    onModule,
    setSubmoduleTitle,
    setDependencyNote,
  } = usePermissionWorkspace({ provider, disabled, visibility, catalogue, states, setStates });
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        flex: 1,
        height: '100%',
        minHeight: 0,
        bgcolor: 'background.paper',
      }}
    >
      <PermissionWorkspaceNavigation
        modules={navigation}
        selectedModule={moduleTitle}
        selectedSubmodule={submoduleTitle}
        visibility={visibility}
        onModule={onModule}
        onSubmodule={(node) => {
          if (node.title !== submoduleTitle) {
            setSubmoduleTitle(node.title);
            setDependencyNote('');
          }
        }}
        disabled={disabled}
      />
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 1.5, sm: 2.5 },
        }}
      >
        {(visibility ? moduleTitle : selected) ? (
          <>
            <PermissionWorkspaceHeading
              moduleTitle={moduleTitle}
              title={visibility ? moduleTitle : (selected?.title ?? '')}
              subjectName={subjectName ?? (user ? undefined : provider.providerKey)}
              sources={sources}
              user={user}
              visibility={visibility}
              rows={rows}
            />
            {dependencyNote && (
              <Typography role="status" variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
                {dependencyNote}
              </Typography>
            )}
            <PermissionMatrix
              key={`${visibility}:${moduleTitle}:${submoduleTitle}`}
              rows={rows}
              user={user}
              disabled={disabled}
              visibility={visibility}
              onChange={change}
            />
          </>
        ) : visibility ? (
          <Box sx={{ display: 'grid', placeItems: 'center', flex: 1 }}>
            <Stack spacing={1} alignItems="center">
              <Typography variant="h6">Select a module</Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a module to manage its navigation visibility.
              </Typography>
            </Stack>
          </Box>
        ) : (
          <PermissionEmptyState />
        )}
      </Box>
    </Box>
  );
}
