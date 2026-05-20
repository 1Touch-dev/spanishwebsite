import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as newsApi from '@/lib/api/news';
import type { AsyncStatus, NewsItem } from '@/types';

interface NewsState {
  articles: NewsItem[];
  byCountry: Record<string, NewsItem[]>;
  status: AsyncStatus;
  countryStatus: Record<string, AsyncStatus>;
  error: string | null;
}

const initialState: NewsState = {
  articles: [],
  byCountry: {},
  status: 'idle',
  countryStatus: {},
  error: null,
};

export const fetchNews = createAsyncThunk<NewsItem[]>(
  'news/fetchAll',
  async () => {
    return await newsApi.fetchNews();
  },
);

export const fetchNewsByCategory = createAsyncThunk<NewsItem[], string>(
  'news/fetchByCategory',
  async (category) => {
    return await newsApi.fetchNewsByCategory(category);
  },
);

export const fetchNewsByCountry = createAsyncThunk<
  { countryId: string; articles: NewsItem[] },
  string
>('news/fetchByCountry', async (countryId) => {
  const articles = await newsApi.fetchNewsByCountry(countryId);
  return { countryId, articles };
});

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    resetNews(state) {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action: PayloadAction<NewsItem[]>) => {
        state.status = 'succeeded';
        state.articles = action.payload;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load news';
      })
      .addCase(fetchNewsByCategory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNewsByCategory.fulfilled, (state, action: PayloadAction<NewsItem[]>) => {
        state.status = 'succeeded';
        state.articles = action.payload;
      })
      .addCase(fetchNewsByCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load news';
      })
      .addCase(fetchNewsByCountry.pending, (state, action) => {
        const id = action.meta.arg;
        state.countryStatus[id] = 'loading';
      })
      .addCase(fetchNewsByCountry.fulfilled, (state, action) => {
        const { countryId, articles } = action.payload;
        state.byCountry[countryId] = articles;
        state.countryStatus[countryId] = 'succeeded';
      })
      .addCase(fetchNewsByCountry.rejected, (state, action) => {
        const id = action.meta.arg;
        state.countryStatus[id] = 'failed';
        state.error = action.error.message ?? 'Failed to load country news';
      });
  },
});

export const { resetNews } = newsSlice.actions;
export default newsSlice.reducer;
