import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Shield,
  Play,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
} from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, GamePhase } from '../../types/contracts';
import { secretSantaABI } from '../../lib/abi';
import { formatCountdown } from '../../utils/format';
import { useSecretSanta } from '../../hooks/useSecretSanta';

export function AdminPanel() {
  const { address } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Use shared hook for game info
  const { gameInfo, participantCount: participantCountBigInt } = useSecretSanta();

  // Check if current user is owner
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
    abi: secretSantaABI,
    functionName: 'owner',
  });

  // Get additional admin data
  const { data: minParticipantsBigInt } = useReadContract({
    address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
    abi: secretSantaABI,
    functionName: 'minParticipants',
  }) as { data: bigint | undefined };

  const { data: maxParticipantsBigInt } = useReadContract({
    address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
    abi: secretSantaABI,
    functionName: 'maxParticipants',
  }) as { data: bigint | undefined };

  // Get gift submission count
  const { data: giftsSubmitted } = useReadContract({
    address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
    abi: secretSantaABI,
    functionName: 'giftsSubmittedCount',
  });

  // Contract write hooks
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  const currentPhase = gameInfo?.phase;
  const participantCount = Number(participantCountBigInt || 0);
  const minParticipants = Number(minParticipantsBigInt || 3);
  const maxParticipants = Number(maxParticipantsBigInt || 20);

  // Handler: Start Matching
  const handleStartMatching = async () => {
    try {
      setError(null);
      setSuccess(null);

      // First, we need to generate random offset
      // In a real implementation, this would be done by requesting decryption from Gateway
      // Note: The random offset is generated on-chain via FHE.randEuint32()

      await writeContract({
        address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
        abi: secretSantaABI,
        functionName: 'startMatching',
      });

      setSuccess('Matching started! Participants can now submit gifts.');
    } catch (err) {
      console.error('Start matching failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start matching';
      setError(errorMessage);
    }
  };

  // Handler: Trigger Reveal
  const handleTriggerReveal = async () => {
    try {
      setError(null);
      setSuccess(null);

      // Check if reveal time has been reached
      const now = BigInt(Math.floor(Date.now() / 1000));
      if (gameInfo && now < gameInfo.revTime) {
        setError(`Reveal time not reached yet. Wait until ${new Date(Number(gameInfo.revTime) * 1000).toLocaleString()}`);
        return;
      }

      // In production, this would trigger Gateway callback
      // For demo, we'll use a mock decrypted offset
      const mockDecryptedOffset = Math.floor(Math.random() * participantCount) + 1;

      await writeContract({
        address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
        abi: secretSantaABI,
        functionName: 'triggerReveal',
        args: [mockDecryptedOffset],
      });

      setSuccess('Reveal triggered! All matches are now public.');
    } catch (err) {
      console.error('Trigger reveal failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to trigger reveal';
      setError(errorMessage);
    }
  };

  if (!isOwner) {
    return null; // Don't show admin panel to non-owners
  }

  const giftsCount = Number(giftsSubmitted || 0);

  return (
    <Card className="border-2 border-santa-500/30">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-santa-500/10">
            <Shield className="w-6 h-6 text-santa-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Admin Panel</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Game management controls
            </p>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Participants</span>
            </div>
            <p className="text-2xl font-bold">
              {participantCount}
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                / {maxParticipants}
              </span>
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Gifts Submitted</span>
            </div>
            <p className="text-2xl font-bold">
              {giftsCount}
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                / {participantCount}
              </span>
            </p>
          </div>
        </div>

        {/* Registration Phase Actions */}
        {currentPhase === GamePhase.Registration && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {participantCount >= minParticipants
                  ? '✓ Minimum participants reached. Ready to start matching!'
                  : `Waiting for at least ${minParticipants} participants (${minParticipants - participantCount} more needed)`}
              </p>
            </div>

            {gameInfo && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Registration ends in {formatCountdown(gameInfo.regDeadline)}</span>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleStartMatching}
              disabled={participantCount < minParticipants || isPending || isConfirming}
              isLoading={isPending || isConfirming}
            >
              <Play className="w-5 h-5" />
              {isPending ? 'Starting...' : isConfirming ? 'Confirming...' : 'Start Matching'}
            </Button>
          </div>
        )}

        {/* Matching & Gift Submission Phases */}
        {(currentPhase === GamePhase.Matching || currentPhase === GamePhase.GiftSubmission) && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                {currentPhase === GamePhase.Matching
                  ? 'Matching in progress. Participants can now query their recipients.'
                  : `Gift submission phase: ${giftsCount}/${participantCount} gifts submitted`}
              </p>
            </div>

            {gameInfo && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>
                  Gift submission deadline in {formatCountdown(gameInfo.subDeadline)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Waiting Reveal Phase Actions */}
        {currentPhase === GamePhase.WaitingReveal && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ All gifts submitted! Ready to reveal.
              </p>
            </div>

            {gameInfo && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Reveal available in {formatCountdown(gameInfo.revTime)}</span>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleTriggerReveal}
              disabled={isPending || isConfirming}
              isLoading={isPending || isConfirming}
            >
              <Eye className="w-5 h-5" />
              {isPending ? 'Triggering...' : isConfirming ? 'Confirming...' : 'Trigger Reveal'}
            </Button>
          </div>
        )}

        {/* Revealed Phase */}
        {currentPhase === GamePhase.Revealed && (
          <div className="p-4 rounded-xl bg-evergreen-500/10 border border-evergreen-500/20 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-evergreen-500" />
            <p className="text-sm font-medium text-evergreen-600 dark:text-evergreen-400">
              Game Complete! All matches revealed.
            </p>
          </div>
        )}

        {/* Success Message */}
        {isConfirmed && success && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-500 mb-1">Action Failed</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
