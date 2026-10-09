import type { RootState } from 'src/redux/store';
import type { InitialSetup } from 'src/redux/initial-setup/types';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import SetupUserDialog from './setup-user-dialog';
import AcademicWorkspaceDialog from './academic-workspace-dialog';

export default function UsersStep({
  progress,
  onCreate,
}: {
  progress: InitialSetup;
  onCreate: (input: Record<string, unknown>) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [academicsOpen, setAcademicsOpen] = useState(false);
  const canReadAcademics = useSelector((state: RootState) =>
    state.auth.permissions.some(
      (permission: { name: string; isGranted: boolean }) =>
        permission.name === 'InstituteSetup.AcademicSetup.View' && permission.isGranted
    )
  );
  const canCreate = useSelector((state: RootState) =>
    state.auth.permissions.some(
      (permission: { name: string; isGranted: boolean }) =>
        permission.name === 'AbpIdentity.Users.Create' && permission.isGranted
    )
  );
  return (
    <Stack spacing={2}>
      {canReadAcademics && progress.academicYearId && (
        <FormSectionCard
          title="Academic foundation"
          icon="mdi:book-open-outline"
          descriptionTooltip="Add additional boards, mediums, stages, classes and divisions using the academic workspace."
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {progress.draft.yearName} · {progress.draft.className} · Division{' '}
            {progress.draft.divisionName}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:plus" width={16} />}
            onClick={() => setAcademicsOpen(true)}
          >
            Configure more classes and divisions
          </Button>
        </FormSectionCard>
      )}
      <FormSectionCard
        title="Initial administrator"
        icon="mdi:account-key-outline"
        descriptionTooltip="This account was created when your institute was registered."
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="mdi:check-circle-outline" sx={{ color: 'success.main' }} />
          <Typography variant="body2">Your administrator account is already available.</Typography>
        </Stack>
      </FormSectionCard>
      <FormSectionCard
        title="Additional staff"
        icon="mdi:account-group-outline"
        descriptionTooltip="Optional. Staff can also be added later from User management."
        action={
          canCreate && progress.createdUsers.length < 32 ? (
            <Button
              size="small"
              startIcon={<Iconify icon="mdi:plus" width={16} />}
              onClick={() => setOpen(true)}
            >
              Add user
            </Button>
          ) : undefined
        }
      >
        {progress.createdUsers.length ? (
          <Stack spacing={2}>
            {progress.createdUsers.map((user) => (
              <Box key={user.id} data-setup-item>
                <Typography variant="subtitle2">{user.userName}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {user.email}
                </Typography>
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {canCreate
              ? 'No additional users yet. You can continue without adding staff.'
              : 'You can continue. Adding staff requires the User Create permission.'}
          </Typography>
        )}
      </FormSectionCard>
      {open && <SetupUserDialog onClose={() => setOpen(false)} onCreate={onCreate} />}
      {academicsOpen && progress.academicYearId && (
        <AcademicWorkspaceDialog
          yearId={progress.academicYearId}
          onClose={() => setAcademicsOpen(false)}
        />
      )}
    </Stack>
  );
}
