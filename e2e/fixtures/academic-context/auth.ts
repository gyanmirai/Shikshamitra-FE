const session = {
  accessToken: 'synthetic-browser-session',
  profile: { sub: 'fixture-staff', tenantid: 'fixture-school' },
};
export const useSession = () => ({ data: session, status: 'authenticated' });
export const getSession = async () => session;
export const signOut = async () => undefined;
