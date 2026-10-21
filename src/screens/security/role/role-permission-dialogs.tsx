import { useState } from 'react';
import CustomDialog from 'src/components/customDialog';

import PermissionAccessForm from './permission-access-form';

import type { RoleRecord } from './role-form-values';

export default function RolePermissionDialogs({
  role,
  mode,
  onClose,
}: {
  role: RoleRecord;
  mode: 'permissions' | 'visibility';
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const visibility = mode === 'visibility';
  return (
    <CustomDialog
      open
      fullScreen
      title={visibility ? `Set Visibility for ${role.name}` : `Permissions of ${role.name}`}
      titleInfo={
        visibility
          ? 'Choose which modules appear in navigation for this role.'
          : 'Choose which actions this role can perform in each module.'
      }
      handleClose={onClose}
      disableClose={busy}
      paperProps={{ sx: { '& [aria-label="close"]': { minWidth: 44, minHeight: 44 } } }}
    >
      <PermissionAccessForm
        editData={role}
        providerName="R"
        mode={visibility ? 'visibility' : 'actions'}
        handleClose={onClose}
        onBusyChange={setBusy}
      />
    </CustomDialog>
  );
}
