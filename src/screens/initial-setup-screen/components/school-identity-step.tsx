import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Alert, Stack, Button, Typography, CircularProgress } from '@mui/material';
import { useGetSchoolIdentityQuery } from 'src/redux/InstituteSetup/schoolIdentityApi';
import { IdentityEditor } from 'src/screens/setting/school-identity/components/identity-editor';
import { IdentityContent } from 'src/screens/setting/school-identity/components/identity-content';
import { useIdentityPermissions } from 'src/screens/setting/school-identity/hooks/use-identity-permissions';

export default function SchoolIdentityStep() {
  const permissions = useIdentityPermissions();
  const [editing, setEditing] = useState(false);
  const query = useGetSchoolIdentityQuery({}, { skip: !permissions.ready || !permissions.canView });
  const profile = query.currentData;
  if (!permissions.ready) return <CircularProgress aria-label="Loading school identity access" />;
  if (!permissions.canView)
    return (
      <Alert severity="info">
        School Identity is optional. You can continue without adding assets. An authorized
        administrator can configure them later.
      </Alert>
    );
  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Your saved school logo appears in the navigation. If no logo is configured, the default icon
        is used. The navigation name is your school code.
      </Typography>
      {query.isError ? (
        <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
          School Identity could not be loaded. Retry, or continue and configure it later.
        </Alert>
      ) : (
        <>
          {profile?.canManage && permissions.canManageDefaults && (
            <Button
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon={GlobalIcons.edit} />}
              disabled={query.isFetching}
              onClick={() => setEditing(true)}
              sx={{ alignSelf: 'flex-start' }}
            >
              Edit school defaults
            </Button>
          )}
          <IdentityContent profile={profile} context={{}} disabled={query.isFetching} />
        </>
      )}
      {editing && profile && (
        <IdentityEditor profile={profile} context={{}} onClose={() => setEditing(false)} />
      )}
    </Stack>
  );
}
