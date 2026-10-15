import type { IdentityRoleOption } from 'src/redux/role/roleApi';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Alert, Stack } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useDeleteRoleMutation } from 'src/redux/role/roleApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

type Props = {
  role: Pick<IdentityRoleOption, 'id' | 'name'>;
  onClose: () => void;
};

export default function RoleDeleteDialog({ role, onClose }: Props) {
  const [error, setError] = useState('');
  const [deleteRole, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteRoleMutation,
  });

  const close = () => {
    if (!isLoading) onClose();
  };

  const handleDelete = async () => {
    if (isLoading) return;
    setError('');
    const result = await deleteRole(role.id);
    if (result.error) {
      setError(parseApiProblemDetail(result.error).detail);
      return;
    }
    shikshaMitraToast.success({ message: 'Role deleted successfully' });
    onClose();
  };

  return (
    <ConfirmDialog
      open
      onClose={close}
      title={<span id="delete-role-title">Delete Role</span>}
      aria-labelledby="delete-role-title"
      aria-describedby="delete-role-description"
      disableBackdropClick={isLoading}
      disableEscapeKeyDown={isLoading}
      disableCancel={isLoading}
      content={
        <Stack spacing={2}>
          <span id="delete-role-description">
            Delete <strong>{role.name}</strong>? This action cannot be undone.
          </span>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      }
      action={
        <LoadingButton
          variant="contained"
          color="error"
          loading={isLoading}
          onClick={handleDelete}
          sx={{ bgcolor: 'error.dark', '&:hover': { bgcolor: 'error.darker' } }}
        >
          Delete
        </LoadingButton>
      }
    />
  );
}
