import type { IronSession, SessionOptions } from 'iron-session';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';

import { isTokenExpired } from './utils/client';

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
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  try {
    if (session?.access_token && isTokenExpired(session.access_token as string)) {
      const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/getToken`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const token = await tokenRes.json();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token.refresh_token }),
      });
      const data = await res.json();
      session.access_token = data.access_token;
      session.save();
      return session;
    }
    return session;
  } catch (e) {
    console.log(e);
    return session;
  }
}
