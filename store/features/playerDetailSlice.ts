import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { fetchPlayerDetail as fetchPlayerDetailApi } from '@/lib/api/playerDetail';
import type { AsyncStatus, LiveMatch, PlayerDetailPayload, PlayerInfo, PlayerStatistics } from '@/types';

interface PlayerDetailState {
  player: PlayerInfo | null;
  statistics: PlayerStatistics[];
  fixtures: LiveMatch[];
  status: AsyncStatus;
  error: string | null;
  playerId: string | null;
}

const initialState: PlayerDetailState = {
  player: null,
  statistics: [],
  fixtures: [],
  status: 'idle',
  error: null,
  playerId: null,
};

export const fetchPlayerDetail = createAsyncThunk<PlayerDetailPayload, string>(
  'playerDetail/fetch',
  async (playerId) => fetchPlayerDetailApi(playerId),
);

const playerDetailSlice = createSlice({
  name: 'playerDetail',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayerDetail.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.playerId = action.meta.arg;
      })
      .addCase(fetchPlayerDetail.fulfilled, (state, action: PayloadAction<PlayerDetailPayload>) => {
        state.status = 'succeeded';
        state.player = action.payload.player;
        state.statistics = action.payload.statistics;
        state.fixtures = action.payload.recentFixtures;
      })
      .addCase(fetchPlayerDetail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load player';
      });
  },
});

export default playerDetailSlice.reducer;
