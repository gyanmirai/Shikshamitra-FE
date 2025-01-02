'use client';

import type { RootState } from 'src/redux/store';

import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useMemo, useState, useEffect, useCallback, createContext } from 'react';

import { useCookies } from 'src/hooks/use-cookies';
import { useLocalStorage } from 'src/hooks/use-local-storage';

import { getUser } from 'src/redux/user/userSlice';

import { STORAGE_KEY, defaultSettings } from '../config-settings';

import type { SettingsState, SettingsContextValue, SettingsProviderProps } from '../types';

// ----------------------------------------------------------------------

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsConsumer = SettingsContext.Consumer;

// ----------------------------------------------------------------------

export function SettingsProvider({
  children,
  settings,
  caches = 'localStorage',
}: SettingsProviderProps) {
  const cookies = useCookies<SettingsState>(STORAGE_KEY, settings, defaultSettings);

  const customLocalstorage = useLocalStorage<SettingsState>(STORAGE_KEY, settings);

  const values = caches === 'cookie' ? cookies : customLocalstorage;

  const pathname = usePathname();

  const [openDrawer, setOpenDrawer] = useState(false);

  const dispatch = useDispatch();
  const { userInfo, lastAction } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (userInfo === null && !userInfo?.sub && !['/login'].includes(pathname.replace(/\/$/, ''))) {
      console.log('dispatching getUser');
      dispatch(getUser() as any);
    }
  }, [dispatch, lastAction, pathname, userInfo]);

  const onToggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);

  const memoizedValue = useMemo(
    () => ({
      ...values.state,
      canReset: values.canReset,
      onReset: values.resetState,
      onUpdate: values.setState,
      onUpdateField: values.setField,
      openDrawer,
      onCloseDrawer,
      onToggleDrawer,
    }),
    [
      values.canReset,
      values.resetState,
      values.setField,
      values.setState,
      values.state,
      openDrawer,
      onCloseDrawer,
      onToggleDrawer,
    ]
  );

  return (
    // <SessionProvider>
    <SettingsContext.Provider value={memoizedValue}>{children}</SettingsContext.Provider>
    // </SessionProvider>
  );
}
