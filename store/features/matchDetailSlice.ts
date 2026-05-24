import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { fetchMatchDetail as fetchMatchDetailApi } from '@/lib/api/matchDetail';
import type { AsyncStatus, MatchDetailPayload } from '@/types';

interface MatchDetailState {
  detail: MatchDetailPayload | null;
  status: AsyncStatus;
  error: string | null;
  matchId: string | null;
}

const initialState: MatchDetailState = {
  detail: null,
  status: 'idle',
  error: null,
  matchId: null,
};

export const fetchMatchDetail = createAsyncThunk<MatchDetailPayload, string>(
  'matchDetail/fetch',
  async (matchId) => fetchMatchDetailApi(matchId),
);

const matchDetailSlice = createSlice({
  name: 'matchDetail',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatchDetail.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.matchId = action.meta.arg;
      })
      .addCase(fetchMatchDetail.fulfilled, (state, action: PayloadAction<MatchDetailPayload>) => {
        state.status = 'succeeded';
        state.detail = action.payload;
      })
      .addCase(fetchMatchDetail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load match';
      });
  },
});

export default matchDetailSlice.reducer;
