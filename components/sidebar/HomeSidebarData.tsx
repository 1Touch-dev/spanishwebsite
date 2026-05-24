'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchRankings } from '@/store/features/rankingsSlice';
import { StandingsTable } from '@/components/sidebar/StandingsTable';
import { TopScorersWidget } from '@/components/sidebar/TopScorersWidget';

/** Fetches rankings once for homepage sidebar widgets. */
export function HomeSidebarData() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.rankings.status);

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchRankings());
    }
  }, [dispatch, status]);

  return (
    <>
      <StandingsTable autoFetch={false} />
      <TopScorersWidget autoFetch={false} />
    </>
  );
}
