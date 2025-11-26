import type { User, UserManagerSettings } from 'oidc-client-ts';

import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

const oidcConfig: UserManagerSettings = {
  authority: `${process.env.NEXT_PUBLIC_API_URL}`,
  client_id: process.env.NEXT_PUBLIC_CLIENT_ID || '',
  redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || ''}/auth/openiddict`,
  post_logout_redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || ''}/login`,
  response_type: 'code',
  scope: process.env.NEXT_PUBLIC_SCOPE,
  metadataUrl: `${process.env.NEXT_PUBLIC_API_URL}/.well-known/openid-configuration`,
  userStore:
    typeof window !== 'undefined'
      ? new WebStorageStateStore({ store: window.localStorage })
      : undefined,
  automaticSilentRenew: true,
  accessTokenExpiringNotificationTimeInSeconds: 60,
  silent_redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/silent-renew`,
};

export const userManager = new UserManager(oidcConfig);

userManager.events.addAccessTokenExpiring(() => {
  console.info('Access token is about to expire. Renewing...');
  oidcService
    .renewToken()
    .then((user) => {
      console.info('Token renewed successfully:', user);
    })
    .catch((error) => {
      console.error('Token renewal failed:', error);
    });
});

userManager.events.addAccessTokenExpired(() => {
  console.info('Access token expired. Logging out...');
  oidcService.signOut();
});

// Wrapper for all UserManager methods
export const oidcService = {
  signIn: async () => {
    await userManager.signinRedirect();
  },
  completeSignIn: async (): Promise<User> => userManager.signinRedirectCallback(),
  signOut: async () => {
    await userManager.signoutRedirect();
  },
  completeSignOut: async () => {
    await userManager.signoutRedirectCallback();
  },
  getUser: async (): Promise<User | null> => userManager.getUser(),
  renewToken: async () => {
    try {
      const user = await userManager.signinSilent();
      return user;
    } catch (error) {
      console.error('Silent renew failed:', error);
      throw error;
    }
  },
  removeUser: async () => {
    await userManager.removeUser();
  },
  startSilentRenew: async () => {
    await userManager.startSilentRenew();
  },
  stopSilentRenew: async () => {
    await userManager.stopSilentRenew();
  },
  signinSilent: async (): Promise<User | null> => userManager.signinSilent(),
  signinSilentCallback: async () => {
    await userManager.signinSilentCallback();
  },
  signinPopup: async (): Promise<User> => userManager.signinPopup(),
  signinPopupCallback: async () => {
    await userManager.signinPopupCallback();
  },
  signinCallback: async () => {
    await userManager.signinCallback();
  },
  clearStaleState: async () => {
    await userManager.clearStaleState();
  },
};
