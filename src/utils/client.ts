import { jwtDecode } from 'jwt-decode';
import { Issuer } from 'openid-client';

export const clientConfig = {
  url: `${process.env.NEXT_PUBLIC_API_URL}/.well-known/openid-configuration`,
  audience: process.env.NEXT_PUBLIC_API_URL,
  client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
  scope: process.env.NEXT_PUBLIC_SCOPE,
  redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || ''}/auth/openiddict`,
  post_logout_redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || ''}/login`,
  response_type: 'code',
  grant_type: 'authorization_code',
  post_login_route: `${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard`,
};

export async function getClient() {
  const abpIssuer = await Issuer.discover(clientConfig.url!);
  const client = new abpIssuer.Client({
    client_id: clientConfig.client_id!,
    response_types: ['code'],
    redirect_uris: [clientConfig.redirect_uri],
    token_endpoint_auth_method: 'none',
  });
  return client;
}

export const isTokenExpired = (token: string) => {
  const decoded = jwtDecode(token!);
  const expirationTime = decoded.exp! * 1000;
  const currentTime = new Date().getTime();
  return expirationTime < currentTime;
};

export const getCookie = async (key: string) => {
  if (typeof window === 'undefined') {
    return null;
  }
  // const session = await getIronSession(, sessionOptions);
  const cookies: { [key: string]: string } = document.cookie.split('; ').reduce(
    (acc, cookie) => {
      const [keys, value] = cookie.split('=');
      acc[keys] = decodeURIComponent(value);
      return acc;
    },
    {} as { [key: string]: string }
  );
  return cookies[key];
};
