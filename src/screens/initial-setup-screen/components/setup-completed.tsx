// eslint-disable-next-line import/order -- The project sorts styles first; import/order sorts relative modules last.
import styles from './setup-motion.module.css';

import type { AppDispatch } from 'src/redux/store';
import type { InitialSetup } from 'src/redux/initial-setup/types';

import { useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Iconify } from 'src/components/iconify';
import { loadUser } from 'src/redux/auth/authSlice';
import { Box, Alert, Stack, Button, Typography } from '@mui/material';
import {
  setCurrentYear,
  setCurrentBoard,
  setCurrentMedium,
} from 'src/redux/globalState/globalSlice';

export default function SetupCompleted({ progress }: { progress?: InitialSetup }) {
  const { data: session } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!session) return;
    if (progress?.academicYearId) {
      dispatch(
        setCurrentYear({
          id: progress.academicYearId,
          name: progress.draft.yearName,
          startDate: progress.draft.startDate,
          endDate: progress.draft.endDate,
        })
      );
      dispatch(setCurrentBoard({}));
      dispatch(setCurrentMedium({}));
    }
    dispatch(loadUser(session))
      .unwrap()
      .then(() => router.replace('/dashboard'))
      .catch(() => setError(true));
  }, [dispatch, session, router, retry, progress]);
  return (
    <Stack
      className={styles.completion}
      spacing={3}
      alignItems="center"
      sx={{ textAlign: 'center', p: 4, pt: 12 }}
    >
      <Box data-setup-success sx={{ color: 'success.main' }}>
        <Iconify icon="mdi:check-circle-outline" width={72} />
      </Box>
      <Typography variant="h4">Your institute is ready</Typography>
      <Typography color="text.secondary">Opening your dashboard…</Typography>
      {error && (
        <>
          <Alert severity="error">
            Setup is complete, but the updated account context could not be loaded.
          </Alert>
          <Button
            onClick={() => {
              setError(false);
              setRetry((count) => count + 1);
            }}
          >
            Retry
          </Button>
        </>
      )}
    </Stack>
  );
}
