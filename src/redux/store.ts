import type { Store } from '@reduxjs/toolkit';

import { configureStore } from '@reduxjs/toolkit';

import { userApi } from './user/userApi';
import { roleApi } from './role/roleApi';
import { yearApi } from './year/yearApi';
import userReducer from './user/userSlice';
import { boardApi } from './board/boardApi';
import { classApi } from './class/classApi';
import { mediumApi } from './medium/mediumApi';
import { tenantApi } from './tenant/tenantApi';
import { divisionApi } from './division/divisionApi';
import { permissionApi } from './permission/permissionApi';
import { organizationApi } from './oraganization/oraganization';

const store: Store = configureStore({
  reducer: {
    user: userReducer,
    [userApi.reducerPath]: userApi.reducer,
    [roleApi.reducerPath]: roleApi.reducer,
    [permissionApi.reducerPath]: permissionApi.reducer,
    [boardApi.reducerPath]: boardApi.reducer,
    [mediumApi.reducerPath]: mediumApi.reducer,
    [organizationApi.reducerPath]: organizationApi.reducer,
    [classApi.reducerPath]: classApi.reducer,
    [divisionApi.reducerPath]: divisionApi.reducer,
    [yearApi.reducerPath]: yearApi.reducer,
    [tenantApi.reducerPath]: tenantApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(roleApi.middleware)
      .concat(permissionApi.middleware)
      .concat(boardApi.middleware)
      .concat(mediumApi.middleware)
      .concat(organizationApi.middleware)
      .concat(classApi.middleware)
      .concat(divisionApi.middleware)
      .concat(yearApi.middleware)
      .concat(tenantApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
