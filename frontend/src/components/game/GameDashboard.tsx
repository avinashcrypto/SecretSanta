import { Card } from '../ui/Card';
import { Gift, Users, Clock, Sparkles } from 'lucide-react';
import { useSecretSanta } from '../../hooks/useSecretSanta';
import { GamePhase } from '../../types/contracts';
import { formatCountdown } from '../../utils/format';
import { useMemo } from 'react';
import { DashboardSkeleton } from '../ui/Skeleton';

export function GameDashboard() {
  const { gameInfo, participantCount, giftsSubmittedCount } = useSecretSanta();

  const phaseInfo = useMemo(() => {
    if (!gameInfo) return null;

    const phases = [
      {
        phase: GamePhase.Registration,
        title: 'Registration',
        description: 'Players are joining the game',
        color: 'santa',
        icon: Users,
      },
      {
        phase: GamePhase.Matching,
        title: 'Matching',
        description: 'Generating encrypted matches',
        color: 'purple',
        icon: Sparkles,
      },
      {
        phase: GamePhase.GiftSubmission,
        title: 'Gift Submission',
        description: 'Submit your encrypted gifts',
        color: 'evergreen',
        icon: Gift,
      },
      {
        phase: GamePhase.WaitingReveal,
        title: 'Waiting for Reveal',
        description: 'All gifts submitted, waiting...',
        color: 'blue',
        icon: Clock,
      },
      {
        phase: GamePhase.Revealed,
        title: 'Revealed!',
        description: 'See who gave what to whom',
        color: 'santa',
        icon: Sparkles,
      },
    ];

    return phases.find((p) => p.phase === gameInfo.phase) || phases[0];
  }, [gameInfo]);

  const activeDeadline = useMemo(() => {
    if (!gameInfo) return null;

    switch (gameInfo.phase) {
      case GamePhase.Registration:
        return {
          label: 'Registration Ends',
          time: gameInfo.regDeadline,
        };
      case GamePhase.GiftSubmission:
        return {
          label: 'Submission Deadline',
          time: gameInfo.subDeadline,
        };
      case GamePhase.WaitingReveal:
        return {
          label: 'Reveal Time',
          time: gameInfo.revTime,
        };
      default:
        return null;
    }
  }, [gameInfo]);

  if (!gameInfo || !phaseInfo) {
    return <DashboardSkeleton />;
  }

  const Icon = phaseInfo.icon;

  return (
    <Card>
      <div className="space-y-6">
        {/* Current Phase */}
        <div className="flex items-center gap-4">
          <div
            className={`p-4 rounded-2xl bg-${phaseInfo.color}-500/10 border border-${phaseInfo.color}-500/20`}
          >
            <Icon className={`w-8 h-8 text-${phaseInfo.color}-500`} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{phaseInfo.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{phaseInfo.description}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Participants */}
          <div className="p-4 rounded-xl bg-evergreen-500/5 border border-evergreen-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-evergreen-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Participants</p>
            </div>
            <p className="text-2xl font-bold">{participantCount?.toString() || '0'}</p>
          </div>

          {/* Gifts Submitted */}
          {gameInfo.phase >= GamePhase.GiftSubmission && (
            <div className="p-4 rounded-xl bg-santa-500/5 border border-santa-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-santa-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Gifts Submitted</p>
              </div>
              <p className="text-2xl font-bold">
                {giftsSubmittedCount?.toString() || '0'} / {participantCount?.toString() || '0'}
              </p>
            </div>
          )}

          {/* Countdown */}
          {activeDeadline && (
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">{activeDeadline.label}</p>
              </div>
              <p className="text-2xl font-bold">{formatCountdown(activeDeadline.time)}</p>
            </div>
          )}
        </div>

        {/* Progress Bar (for Gift Submission phase) */}
        {gameInfo.phase === GamePhase.GiftSubmission && participantCount && giftsSubmittedCount && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Submission Progress</p>
              <p className="text-sm font-medium">
                {Math.round((Number(giftsSubmittedCount) / Number(participantCount)) * 100)}%
              </p>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-santa-500 to-evergreen-500 transition-all duration-500"
                style={{
                  width: `${(Number(giftsSubmittedCount) / Number(participantCount)) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
