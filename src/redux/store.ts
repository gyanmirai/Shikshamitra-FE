import type { Store } from '@reduxjs/toolkit';

import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';
import { configureStore, combineReducers } from '@reduxjs/toolkit';

import { userApi } from './user/userApi';
import { roleApi } from './role/roleApi';
import { yearApi } from './year/yearApi';
import userReducer from './user/userSlice';
import { boardApi } from './board/boardApi';
import { classApi } from './class/classApi';
import { mediumApi } from './medium/mediumApi';
import { tenantApi } from './tenant/tenantApi';
import { divisionApi } from './division/divisionApi';
import { employeeApi } from './employee/employeeApi';
import globalStateReducer from './globalState/globalSlice';
import { permissionApi } from './permission/permissionApi';
import { organizationApi } from './oraganization/oraganization';
import confirmPopupReducer from './confirmPopup/confirmPopupSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['globalState', 'user'],
};

const reducers = combineReducers({
  user: userReducer,
  globalState: globalStateReducer,
  confirmPopup: confirmPopupReducer,
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
  [employeeApi.reducerPath]: employeeApi.reducer,
});

const store: Store = configureStore({
  reducer: persistReducer(persistConfig, reducers),
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
      .concat(tenantApi.middleware)
      .concat(employeeApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

export const persistor = persistStore(store);
