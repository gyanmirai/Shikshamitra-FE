'use client';

import { useSession } from 'next-auth/react';
import { memo, useRef, useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import store, { persistor } from './store';
import { loadUser } from './auth/authSlice';

const ReduxProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      const { target } = e;
      if (
        target.tagName === 'INPUT' &&
        target.type === 'number' &&
        ['e', 'E', '+', '-'].includes(e.key)
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LoadUser />
        {children}
      </PersistGate>
    </Provider>
  );
};

export default ReduxProvider;

const LoadUser = memo(() => {
  const dispatch = useDispatch();
  const session: any = useSession();
  const { data: sessionData } = session;

  const isInitialize = useRef(false);

  useEffect(() => {
    if (sessionData?.profile?.sub && !isInitialize.current) {
      dispatch(loadUser(sessionData) as any);
      isInitialize.current = true;
    }
  }, [dispatch, sessionData]);

  return null;
});
