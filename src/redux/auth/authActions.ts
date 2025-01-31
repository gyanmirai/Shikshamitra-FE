import { createAsyncThunk } from '@reduxjs/toolkit';

import { clearUser, getEmployee, setUser } from './authSlice';
import { oidcService } from 'src/utils/oidcClient';

export const signInUser = createAsyncThunk('auth/signIn', async () => {
  await oidcService.signIn();
});

export const completeSignInUser = createAsyncThunk(
  'auth/completeSignIn',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const user = await oidcService.completeSignIn();
      const userPlanObject = JSON.parse(JSON.stringify(user));

      await dispatch(getEmployee(userPlanObject)).unwrap();
      dispatch(setUser(userPlanObject));
      return user;
    } catch (error) {
      console.error('Sign-in completion failed:', error);
      return rejectWithValue(error);
    }
  }
);

export const signOutUser = createAsyncThunk('auth/signOut', async () => {
  await oidcService.signOut();
});

export const completeSignOutUser = createAsyncThunk(
  'auth/completeSignOut',
  async (_, { dispatch }) => {
    await oidcService.completeSignOut();
    dispatch(clearUser());
  }
);

export const fetchUser = createAsyncThunk('auth/fetchUser', async (_, { dispatch }) => {
  const user = await oidcService.getUser();
  if (user) {
    dispatch(setUser(JSON.parse(JSON.stringify(user))));
  } else {
    dispatch(clearUser());
  }
  return user;
});

export const removeUser = createAsyncThunk('auth/removeUser', async (_, { dispatch }) => {
  await oidcService.removeUser();
  dispatch(clearUser());
});

export const startSilentRenew = createAsyncThunk('auth/startSilentRenew', async () => {
  await oidcService.startSilentRenew();
});

export const stopSilentRenew = createAsyncThunk('auth/stopSilentRenew', async () => {
  await oidcService.stopSilentRenew();
});

export const signInSilentUser = createAsyncThunk('auth/signInSilent', async (_, { dispatch }) => {
  const user = await oidcService.signinSilent();
  dispatch(setUser(JSON.parse(JSON.stringify(user))));
  return user;
});

export const signInSilentCallback = createAsyncThunk('auth/signInSilentCallback', async () => {
  await oidcService.signinSilentCallback();
});

export const signInPopupUser = createAsyncThunk('auth/signInPopup', async (_, { dispatch }) => {
  const user = await oidcService.signinPopup();
  dispatch(setUser(JSON.parse(JSON.stringify(user))));
  return user;
});

export const signInPopupCallback = createAsyncThunk('auth/signInPopupCallback', async () => {
  await oidcService.signinPopupCallback();
});

export const clearStaleState = createAsyncThunk('auth/clearStaleState', async () => {
  await oidcService.clearStaleState();
});

export const renewToken = createAsyncThunk('auth/renewToken', async (_, { dispatch }) => {
  const user = await oidcService.renewToken();
  dispatch(setUser(JSON.parse(JSON.stringify(user))));
  return user;
});
