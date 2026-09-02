type CredentialsSignInInput = {
  email: string;
  password: string;
  organizationName: string;
};

type CredentialsSignInResult = {
  code?: string;
  error?: string;
  url: string;
};

type AuthRedirectResponse = {
  url?: string;
};

export const signInWithCredentials = async ({
  email,
  password,
  organizationName,
}: CredentialsSignInInput): Promise<CredentialsSignInResult> => {
  const csrfResponse = await fetch('/api/auth/csrf');

  if (!csrfResponse.ok) {
    throw new Error('Unable to initialize authentication');
  }

  const { csrfToken } = (await csrfResponse.json()) as { csrfToken?: string };

  if (!csrfToken) {
    throw new Error('Authentication token is missing');
  }

  const callbackUrl = new URL('/dashboard', window.location.origin).toString();
  const callbackResponse = await fetch('/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Auth-Return-Redirect': '1',
    },
    body: new URLSearchParams({
      email,
      password,
      organizationName,
      csrfToken,
      callbackUrl,
    }),
  });

  const data = (await callbackResponse.json()) as AuthRedirectResponse;

  if (!data.url) {
    throw new Error('Authentication response is missing a redirect URL');
  }

  const responseUrl = new URL(data.url, window.location.origin);
  const error = responseUrl.searchParams.get('error') ?? undefined;
  const code = responseUrl.searchParams.get('code') ?? undefined;

  return {
    code,
    error,
    url: error ? callbackUrl : responseUrl.toString(),
  };
};
