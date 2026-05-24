import { configureStore } from '@reduxjs/toolkit';
import newsReducer from './features/newsSlice';
import matchesReducer from './features/matchesSlice';
import rankingsReducer from './features/rankingsSlice';
import countriesReducer from './features/countriesSlice';
import matchDetailReducer from './features/matchDetailSlice';
import playerDetailReducer from './features/playerDetailSlice';
import teamDetailReducer from './features/teamDetailSlice';

export const makeStore = () =>
  configureStore({
    reducer: {
      news: newsReducer,
      matches: matchesReducer,
      rankings: rankingsReducer,
      countries: countriesReducer,
      matchDetail: matchDetailReducer,
      playerDetail: playerDetailReducer,
      teamDetail: teamDetailReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
