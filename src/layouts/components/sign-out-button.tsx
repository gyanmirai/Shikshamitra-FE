import type { ButtonProps } from '@mui/material/Button';
import type { Theme, SxProps } from '@mui/material/styles';

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import Button from '@mui/material/Button';

import { useRouter } from 'src/routes/hooks';

import { logout } from 'src/redux/user/userSlice';

// ----------------------------------------------------------------------

type Props = ButtonProps & {
  sx?: SxProps<Theme>;
  onClose?: () => void;
};

export function SignOutButton({ onClose, ...other }: Props) {
  const router = useRouter();

  // const { checkUserSession } = useAuthContext();
  const dispatch = useDispatch();
  const handleLogout = useCallback(async () => {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      dispatch(logout());
      router.push('/auth/logout');

      onClose?.();
    } catch (error) {
      console.error(error);
    }
  }, [dispatch, onClose, router]);

  return (
    <Button fullWidth variant="soft" size="large" color="error" onClick={handleLogout} {...other}>
      Logout
    </Button>
  );
}
