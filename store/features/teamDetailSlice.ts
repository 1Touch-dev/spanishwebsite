import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { fetchTeamDetail as fetchTeamDetailApi } from '@/lib/api/teamDetail';
import type {
  AsyncStatus,
  LiveMatch,
  SquadPlayer,
  StandingRow,
  TeamDetailPayload,
  TeamInfo,
} from '@/types';

interface TeamDetailState {
  team: TeamInfo | null;
  squad: SquadPlayer[];
  fixtures: LiveMatch[];
  results: LiveMatch[];
  standings: StandingRow[];
  leagueId?: number;
  season?: number;
  status: AsyncStatus;
  error: string | null;
  teamId: string | null;
}

const initialState: TeamDetailState = {
  team: null,
  squad: [],
  fixtures: [],
  results: [],
  standings: [],
  status: 'idle',
  error: null,
  teamId: null,
};

export const fetchTeamDetail = createAsyncThunk<TeamDetailPayload, string>(
  'teamDetail/fetch',
  async (teamId) => fetchTeamDetailApi(teamId),
);

const teamDetailSlice = createSlice({
  name: 'teamDetail',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamDetail.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.teamId = action.meta.arg;
      })
      .addCase(fetchTeamDetail.fulfilled, (state, action: PayloadAction<TeamDetailPayload>) => {
        state.status = 'succeeded';
        state.team = action.payload.team;
        state.squad = action.payload.squad;
        state.fixtures = action.payload.fixtures;
        state.results = action.payload.results;
        state.standings = action.payload.standings;
        state.leagueId = action.payload.leagueId;
        state.season = action.payload.season;
      })
      .addCase(fetchTeamDetail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load team';
      });
  },
});

export default teamDetailSlice.reducer;
