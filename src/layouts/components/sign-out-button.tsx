import type { ButtonProps } from '@mui/material/Button';
import type { Theme, SxProps } from '@mui/material/styles';

import { LoadingButton } from '@mui/lab';
import { signOut } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { useState, useCallback } from 'react';
import { clearUser } from 'src/redux/auth/authSlice';

// ----------------------------------------------------------------------

type Props = ButtonProps & {
  sx?: SxProps<Theme>;
  onClose?: () => void;
};

export function SignOutButton({ onClose, ...other }: Props) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = useCallback(async () => {
    try {
      setLoading(true);
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
  }, [dispatch, onClose]);

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
