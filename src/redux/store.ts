import storage from 'redux-persist/lib/storage';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import { configureStore, combineReducers } from '@reduxjs/toolkit';

import { api } from './service';
import authReducer from './auth/authSlice';
import globalStateReducer from './globalState/globalSlice';
import { openLibraryApi } from './library/LibraryDataSearch';
import confirmPopupReducer from './confirmPopup/confirmPopupSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['globalState'],
};

const reducers = combineReducers({
  auth: authReducer,
  globalState: globalStateReducer,
  confirmPopup: confirmPopupReducer,
  [api.reducerPath]: api.reducer,
  [openLibraryApi.reducerPath]: openLibraryApi.reducer,
});

const store = configureStore({
  reducer: persistReducer(persistConfig, reducers),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat([api.middleware, openLibraryApi.middleware]),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);

export default store;

export const persistor = persistStore(store);
