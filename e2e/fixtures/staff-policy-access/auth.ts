const session = {
  accessToken: 'synthetic-staff-policy-test',
  user: { id: 'synthetic-user', name: 'Delegated staff administrator' },
  profile: { sub: 'synthetic-user', tenantid: 'synthetic-school' },
};

export const getSession = async () => session;
export const useSession = () => ({ data: session, status: 'authenticated' });
export const signOut = async () => undefined;
