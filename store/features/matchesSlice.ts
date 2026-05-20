import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { fetchMatches as fetchMatchesApi, type FetchMatchesParams } from '@/lib/api/matches';
import type { AsyncStatus, LiveMatch } from '@/types';

interface MatchesState {
  matches: LiveMatch[];
  status: AsyncStatus;
  error: string | null;
  countryId: string | null;
  tab: 'live' | 'upcoming' | 'results';
}

const initialState: MatchesState = {
  matches: [],
  status: 'idle',
  error: null,
  countryId: null,
  tab: 'live',
};

export const fetchMatches = createAsyncThunk<LiveMatch[], FetchMatchesParams | undefined>(
  'matches/fetchAll',
  async (params) => {
    return await fetchMatchesApi(params ?? {});
  },
);

const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatches.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        const arg = action.meta.arg ?? {};
        state.countryId = arg.countryId ?? null;
        state.tab = arg.tab ?? 'live';
      })
      .addCase(fetchMatches.fulfilled, (state, action: PayloadAction<LiveMatch[]>) => {
        state.status = 'succeeded';
        state.matches = action.payload;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load matches';
      });
  },
});

export default matchesSlice.reducer;
