'use client';

import { memo, useMemo } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import store, { persistor } from './store';
import { loadUser } from './auth/authSlice';

const ReduxProvider = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    {' '}
    <PersistGate loading={null} persistor={persistor}>
      <LoadUser />
      {children}
    </PersistGate>
  </Provider>
);

export default ReduxProvider;

const LoadUser = memo(() => {
  const dispatch = useDispatch();
  useMemo(() => {
    dispatch(loadUser() as any);
  }, [dispatch]);

  return <iframe src="/silent-renew" style={{ display: 'none' }} title="Silent Token Renewal" />;
});
