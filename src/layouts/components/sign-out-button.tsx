import type { ButtonProps } from '@mui/material/Button';
import type { Theme, SxProps } from '@mui/material/styles';

import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import { useRouter } from 'src/routes/hooks';
import { useState, useCallback } from 'react';
import { signOutUser } from 'src/redux/auth/authActions';

// ----------------------------------------------------------------------

type Props = ButtonProps & {
  sx?: SxProps<Theme>;
  onClose?: () => void;
};

export function SignOutButton({ onClose, ...other }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // const { checkUserSession } = useAuthContext();
  const dispatch = useDispatch();
  const handleLogout = useCallback(async () => {
    try {
      setLoading(true);
      await dispatch(signOutUser() as any).unwrap();
      setLoading(false);
      onClose?.();
      router.push('/login');
    } catch (error) {
      console.error(error);
    }
  }, [dispatch, onClose, router]);

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
