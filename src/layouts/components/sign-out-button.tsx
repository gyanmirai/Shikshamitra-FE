import type { ButtonProps } from '@mui/material/Button';
import type { Theme, SxProps } from '@mui/material/styles';

import { LoadingButton } from '@mui/lab';
import { signOut } from 'next-auth/react';
import { useState, useCallback } from 'react';

// ----------------------------------------------------------------------

type Props = ButtonProps & {
  sx?: SxProps<Theme>;
  onClose?: () => void;
};

export function SignOutButton({ onClose, ...other }: Props) {
  const [loading, setLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      setLoading(true);
      // await dispatch(signOutUser() as any).unwrap();
      await signOut({
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      });
      setLoading(false);
      onClose?.();
    } catch (error) {
      console.error(error);
    }
  }, [onClose]);

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
