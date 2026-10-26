import { configureStore } from '@reduxjs/toolkit';
import { boardApi } from 'src/redux/board/boardApi';

export const store = configureStore({
  reducer: { [boardApi.reducerPath]: boardApi.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(boardApi.middleware),
});

store.dispatch(
  boardApi.util.upsertQueryEntries([
    {
      endpointName: 'getBoardOptions',
      arg: undefined,
      value: [
        { value: 0, label: 'CBSE' },
        { value: 1, label: 'GSEB' },
      ],
    },
  ])
);
