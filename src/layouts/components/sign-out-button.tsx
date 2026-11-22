import type { ButtonProps } from '@mui/material/Button';
import type { Theme, SxProps } from '@mui/material/styles';

import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import { useState, useCallback } from 'react';
import { clearUser } from 'src/redux/auth/authSlice';
import { signOut, useSession } from 'next-auth/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { useDisableWebPushMutation } from 'src/redux/communication/notification/web-push-api';
import { webPushOwner, removePushDevice, endWebPushSession } from 'src/hooks/notifications/web-push-device';

// ----------------------------------------------------------------------

type Props = ButtonProps & {
  sx?: SxProps<Theme>;
  onClose?: () => void;
};

export function SignOutButton({ onClose, ...other }: Props) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { data } = useSession();
  const profile = (data as { profile?: { tenantid?: string; sub?: string } } | null)?.profile;
  const owner = webPushOwner(profile?.tenantid, profile?.sub);
  const [disableWebPush] = useDisableWebPushMutation();

  const handleLogout = useCallback(async () => {
    try {
      setLoading(true);
      if (owner) {
        await removePushDevice(owner, (device) =>
          device.id ? disableWebPush({ owner, id: device.id }).unwrap() : Promise.resolve()
        ).catch(() => undefined);
        await endWebPushSession(owner).catch(() => undefined);
      }
      clearCachedAuthSession();
      dispatch(clearUser());
      await signOut({
        // callbackUrl: `/login`,
        redirectTo: '/login',
      });
      onClose?.();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [disableWebPush, dispatch, onClose, owner]);

  return (
    <LoadingButton
      loading={loading}
      fullWidth
      variant="soft"
      size="large"
      color="error"
      onClick={handleLogout}
      {...other}
    >
      Logout
    </LoadingButton>
  );
}
