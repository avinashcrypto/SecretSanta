import { Card } from '../ui/Card';
import { Users, Copy, CheckCircle } from 'lucide-react';
import { useSecretSanta } from '../../hooks/useSecretSanta';
import { useAccount } from 'wagmi';
import { copyToClipboard } from '../../utils/format';
import { useState } from 'react';

export function ParticipantList() {
  const { address: currentAddress } = useAccount();
  const { participants } = useSecretSanta();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopy = async (address: string) => {
    const success = await copyToClipboard(address);
    if (success) {
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    }
  };

  // Generate avatar color based on address
  const getAvatarColor = (address: string) => {
    const colors = [
      'bg-santa-500',
      'bg-evergreen-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    const index = parseInt(address.slice(2, 4), 16) % colors.length;
    return colors[index];
  };

  if (!participants || participants.length === 0) {
    return (
      <Card className="text-center py-8">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">No Participants Yet</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Be the first to join the Secret Santa game!
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-evergreen-500/10">
              <Users className="w-5 h-5 text-evergreen-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Participants</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {participants.length} {participants.length === 1 ? 'player' : 'players'} registered
              </p>
            </div>
          </div>
        </div>

        {/* Participant List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {participants.map((participant, index) => (
            <div
              key={participant}
              className={`
                p-3 rounded-xl border transition-all
                ${
                  participant.toLowerCase() === currentAddress?.toLowerCase()
                    ? 'bg-santa-500/10 border-santa-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className={`
                    w-10 h-10 rounded-full ${getAvatarColor(participant)}
                    flex items-center justify-center text-white font-bold
                  `}
                >
                  {index + 1}
                </div>

                {/* Address */}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm truncate">{participant}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {participant.toLowerCase() === currentAddress?.toLowerCase()
                      ? 'You'
                      : `Player #${index + 1}`}
                  </p>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => handleCopy(participant)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Copy address"
                >
                  {copiedAddress === participant ? (
                    <CheckCircle className="w-4 h-4 text-evergreen-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-santa-500/5 to-evergreen-500/5 border border-santa-500/10">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{participants.length}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Players</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {participants.filter(
                  (p) => p.toLowerCase() === currentAddress?.toLowerCase()
                ).length > 0
                  ? '✓'
                  : '−'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Your Status</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
