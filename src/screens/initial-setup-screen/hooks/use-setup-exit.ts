import type { AppDispatch } from 'src/redux/store';

import { signOut } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { clearUser } from 'src/redux/auth/authSlice';
import { clearCachedAuthSession } from 'src/redux/session-cache';

export function useSetupExit(save: () => Promise<void>) {
  const dispatch = useDispatch<AppDispatch>();
  return async () => {
    try {
      await save();
      clearCachedAuthSession();
      dispatch(clearUser());
      await signOut({ redirectTo: '/login' });
    } catch {
      /* A failed save keeps the draft and prevents leaving. */
    }
  };
}
