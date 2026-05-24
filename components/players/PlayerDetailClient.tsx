'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPlayerDetail } from '@/store/features/playerDetailSlice';
import { PlayerProfileCard } from './PlayerProfileCard';
import { PlayerSeasonStats } from './PlayerSeasonStats';
import { PlayerRecentFixtures } from './PlayerRecentFixtures';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

interface PlayerDetailClientProps {
  playerId: string;
}

export function PlayerDetailClient({ playerId }: PlayerDetailClientProps) {
  const dispatch = useAppDispatch();
  const t = useTranslations('detail');
  const tStates = useTranslations('states');
  const { player, statistics, fixtures, status, error } = useAppSelector((s) => s.playerDetail);

  useEffect(() => {
    void dispatch(fetchPlayerDetail(playerId));
  }, [playerId, dispatch]);

  if (status === 'loading') {
    return (
      <div className="container-fh space-y-3 py-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (status === 'failed' || !player) {
    return (
      <div className="container-fh py-6">
        <ErrorState
          title={tStates('errorTitle')}
          message={error ?? t('playerNotFound')}
          retryLabel={tStates('retry')}
          onRetry={() => void dispatch(fetchPlayerDetail(playerId))}
        />
      </div>
    );
  }

  return (
    <div className="container-fh max-w-4xl space-y-6 py-6">
      <PlayerProfileCard player={player} statistics={statistics} />
      <PlayerSeasonStats statistics={statistics} />
      <PlayerRecentFixtures fixtures={fixtures} />
    </div>
  );
}

export default PlayerDetailClient;
