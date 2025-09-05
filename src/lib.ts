import type { IronSession, SessionOptions } from 'iron-session';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';

export interface SessionData {
  isLoggedIn: boolean;
  access_token?: string;
  refresh_token?: string;
  code_verifier?: string;
  userInfo?: Record<string, any>;
  tenantId?: string;
  [key: string]: any;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
  access_token: undefined,
  code_verifier: undefined,
  userInfo: undefined,
  tenantId: undefined,
};

export const sessionOptions: SessionOptions = {
  password: 'sdjkjdskajdsajdsalndljsandjajdasds',
  cookieName: 'next_js_session',
  cookieOptions: {
    // secure only works in `https` environments
    // if your localhost is not on `https`, then use: `secure: process.env.NODE_ENV === "production"`
    secure: false,
  },
  ttl: 60 * 60 * 24 * 7, // 1 week
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  return session;
}
