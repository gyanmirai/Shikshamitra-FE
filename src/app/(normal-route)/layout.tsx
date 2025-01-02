import type React from 'react';

import { redirect } from 'next/navigation';

import { getSession } from 'src/lib';

const NormalLayout: React.FC<any> = async ({ children }) => {
  const session = await getSession();

  if (session.isLoggedIn) {
    redirect('/dashboard');
  }
  return children;
};

export default NormalLayout;
