import type { Store } from '@reduxjs/toolkit';

import { configureStore } from '@reduxjs/toolkit';

import { userApi } from './user/userApi';
import userReducer from './user/userSlice';

const store: Store = configureStore({
  reducer: {
    user: userReducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(userApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
