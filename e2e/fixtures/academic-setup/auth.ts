export async function getSession() { return { accessToken: 'synthetic-local-test' }; }
export async function signOut() { throw new Error('The synthetic test session was rejected.'); }
