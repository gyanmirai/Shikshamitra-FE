import { useState, useEffect } from 'react';

export type LoginCompanionState = 'welcome' | 'helper' | 'password' | 'signing-in' | 'success';

type Props = { isSubmitting: boolean; loginSucceeded: boolean };

export function useLoginCompanion({ isSubmitting, loginSucceeded }: Props) {
  const [welcoming, setWelcoming] = useState(true);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setWelcoming(false), 1800);
    return () => window.clearTimeout(timeout);
  }, []);

  const onPasswordFocusChange = (focused: boolean) => {
    setWelcoming(false);
    setPasswordFocused(focused);
  };

  const state: LoginCompanionState = loginSucceeded
    ? 'success'
    : isSubmitting
      ? 'signing-in'
      : passwordFocused
        ? 'password'
        : welcoming
          ? 'welcome'
          : 'helper';

  return { state, onPasswordFocusChange };
}
