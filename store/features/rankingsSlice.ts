import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { fetchRankings as fetchRankingsApi, type FetchRankingsParams } from '@/lib/api/rankings';
import type { AsyncStatus, RankingsPayload, StandingRow, TopScorer } from '@/types';

interface RankingsState {
  standings: StandingRow[];
  topScorers: TopScorer[];
  status: AsyncStatus;
  error: string | null;
  countryId: string | null;
}

const initialState: RankingsState = {
  standings: [],
  topScorers: [],
  status: 'idle',
  error: null,
  countryId: null,
};

export const fetchRankings = createAsyncThunk<RankingsPayload, FetchRankingsParams | undefined>(
  'rankings/fetchAll',
  async (params) => {
    return await fetchRankingsApi(params ?? {});
  },
);

const rankingsSlice = createSlice({
  name: 'rankings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRankings.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.countryId = action.meta.arg?.countryId ?? null;
      })
      .addCase(fetchRankings.fulfilled, (state, action: PayloadAction<RankingsPayload>) => {
        state.status = 'succeeded';
        state.standings = action.payload.standings;
        state.topScorers = action.payload.topScorers;
      })
      .addCase(fetchRankings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load rankings';
      });
  },
});

export default rankingsSlice.reducer;
