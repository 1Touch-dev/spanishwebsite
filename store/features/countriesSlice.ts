import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { fetchCountries as fetchCountriesApi } from '@/lib/api/countries';
import type { AsyncStatus, Country } from '@/types';

interface CountriesState {
  countries: Country[];
  selected: string | null;
  status: AsyncStatus;
  error: string | null;
}

const initialState: CountriesState = {
  countries: [],
  selected: null,
  status: 'idle',
  error: null,
};

export const fetchCountries = createAsyncThunk<Country[]>(
  'countries/fetchAll',
  async () => {
    return await fetchCountriesApi();
  },
);

const countriesSlice = createSlice({
  name: 'countries',
  initialState,
  reducers: {
    selectCountry(state, action: PayloadAction<string | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action: PayloadAction<Country[]>) => {
        state.status = 'succeeded';
        state.countries = action.payload;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load countries';
      });
  },
});

export const { selectCountry } = countriesSlice.actions;
export default countriesSlice.reducer;
