const session = {
  accessToken: 'synthetic-permission-feedback-token',
  profile: { sub: 'synthetic-user', tenantid: 'synthetic-school' },
};

export const getSession = async () => session;
export const signOut = async () => undefined;
