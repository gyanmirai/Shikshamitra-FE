import type { ReactNode } from 'react';

const session = { profile: { sub: 'synthetic-user', tenantId: 'synthetic-tenant' }, accessToken: 'fixture-only' };
export const useSession = () => ({ data: session, status: 'authenticated' });
export const getSession = async () => session;
export const signOut = async () => undefined;
export function SessionProvider({ children }: { children: ReactNode }) { return children; }
