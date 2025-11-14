import { Card } from '../ui/Card';
import { Check, Circle, Clock } from 'lucide-react';
import { useSecretSanta } from '../../hooks/useSecretSanta';
import { GamePhase } from '../../types/contracts';
import { formatDate } from '../../utils/format';

export function GameTimeline() {
  const { gameInfo } = useSecretSanta();

  const phases = [
    {
      phase: GamePhase.Registration,
      title: 'Registration',
      description: 'Join the game',
      deadline: gameInfo?.regDeadline,
    },
    {
      phase: GamePhase.Matching,
      title: 'Matching',
      description: 'Generate pairs',
      deadline: null,
    },
    {
      phase: GamePhase.GiftSubmission,
      title: 'Gift Submission',
      description: 'Submit gifts',
      deadline: gameInfo?.subDeadline,
    },
    {
      phase: GamePhase.WaitingReveal,
      title: 'Waiting',
      description: 'Preparing reveal',
      deadline: gameInfo?.revTime,
    },
    {
      phase: GamePhase.Revealed,
      title: 'Revealed',
      description: 'See all matches',
      deadline: null,
    },
  ];

  const currentPhase = gameInfo?.phase ?? 0;

  const getPhaseStatus = (phase: number) => {
    if (phase < currentPhase) return 'completed';
    if (phase === currentPhase) return 'current';
    return 'upcoming';
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Game Timeline</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track the progress of your Secret Santa game
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-santa-500 to-evergreen-500" />

          {/* Phase Items */}
          <div className="space-y-8">
            {phases.map((phase) => {
              const status = getPhaseStatus(phase.phase);

              return (
                <div key={phase.phase} className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`
                      relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                      transition-all duration-300
                      ${
                        status === 'completed'
                          ? 'bg-evergreen-500 shadow-lg shadow-evergreen-500/30'
                          : status === 'current'
                          ? 'bg-santa-500 shadow-lg shadow-santa-500/30 animate-pulse'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }
                    `}
                  >
                    {status === 'completed' ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : status === 'current' ? (
                      <Clock className="w-5 h-5 text-white" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div
                      className={`
                        p-4 rounded-xl transition-all
                        ${
                          status === 'current'
                            ? 'bg-santa-500/10 border-2 border-santa-500/30'
                            : status === 'completed'
                            ? 'bg-evergreen-500/5 border border-evergreen-500/20'
                            : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4
                            className={`
                              font-semibold
                              ${
                                status === 'current'
                                  ? 'text-santa-500'
                                  : status === 'completed'
                                  ? 'text-evergreen-500'
                                  : 'text-gray-500'
                              }
                            `}
                          >
                            {phase.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {phase.description}
                          </p>
                        </div>

                        {status === 'current' && (
                          <span className="px-3 py-1 rounded-full bg-santa-500 text-white text-xs font-medium">
                            Active
                          </span>
                        )}
                      </div>

                      {/* Deadline */}
                      {phase.deadline && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            <strong>Deadline:</strong> {formatDate(phase.deadline)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-santa-500/5 to-evergreen-500/5 border border-santa-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
              <p className="text-lg font-bold">
                Phase {currentPhase + 1} of {phases.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Completion</p>
              <p className="text-lg font-bold">
                {Math.round(((currentPhase + 1) / phases.length) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
