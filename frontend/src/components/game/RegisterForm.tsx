import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { useSecretSanta } from '../../hooks/useSecretSanta';
import { CONTRACT_ADDRESSES } from '../../types/contracts';
import { secretSantaABI } from '../../lib/abi';
import { formatEth } from '../../utils/format';
import { parseEther } from 'viem';

export function RegisterForm() {
  const { address, isConnected } = useAccount();
  const { register, isPending, isConfirming, isConfirmed, error } = useSecretSanta();

  // Read entry fee from contract
  const { data: entryFee } = useReadContract({
    address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
    abi: secretSantaABI,
    functionName: 'entryFee',
  }) as { data: bigint | undefined };

  // Check if already registered
  const { data: isRegistered } = useReadContract({
    address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
    abi: secretSantaABI,
    functionName: 'isRegistered',
    args: address ? [address] : undefined,
  }) as { data: boolean | undefined };

  const [customFee, setCustomFee] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const handleRegister = async () => {
    try {
      const fee = useCustom && customFee ? parseEther(customFee) : entryFee;
      if (!fee) return;

      await register(fee);
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  if (!isConnected) {
    return (
      <Card className="text-center py-8">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
        <h3 className="text-xl font-semibold mb-2">Wallet Not Connected</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please connect your wallet to register for the game
        </p>
      </Card>
    );
  }

  if (isRegistered) {
    return (
      <Card className="text-center py-8 border-2 border-evergreen-500/30">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-evergreen-500" />
        <h3 className="text-xl font-semibold mb-2 text-evergreen-500">Already Registered!</h3>
        <p className="text-gray-600 dark:text-gray-400">
          You're all set for the Secret Santa game
        </p>
      </Card>
    );
  }

  if (isConfirmed) {
    return (
      <Card className="text-center py-8 border-2 border-evergreen-500/30">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-evergreen-500 animate-bounce" />
        <h3 className="text-xl font-semibold mb-2 text-evergreen-500">Registration Successful!</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to the Secret Santa game! 🎁
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-santa-500/10">
            <UserPlus className="w-6 h-6 text-santa-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Register for Secret Santa</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Join the game by paying the entry fee
            </p>
          </div>
        </div>

        {/* Entry Fee Display */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-santa-500/5 to-evergreen-500/5 border border-santa-500/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Entry Fee</p>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={useCustom}
                onChange={(e) => setUseCustom(e.target.checked)}
                className="rounded"
              />
              Custom amount
            </label>
          </div>

          {useCustom ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.001"
                placeholder="0.01"
                value={customFee}
                onChange={(e) => setCustomFee(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-santa-500"
              />
              <span className="text-lg font-bold">ETH</span>
            </div>
          ) : (
            <p className="text-3xl font-bold">
              {entryFee ? formatEth(entryFee, 4) : '...'} ETH
            </p>
          )}
        </div>

        {/* Register Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleRegister}
          disabled={isPending || isConfirming || !entryFee}
          isLoading={isPending || isConfirming}
        >
          {isPending
            ? 'Waiting for Approval...'
            : isConfirming
            ? 'Confirming...'
            : 'Register Now'}
        </Button>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-500">Registration Failed</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {error.message || 'Please try again'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Note:</strong> By registering, you agree to participate in the gift exchange.
            The entry fee will be collected and can be used as a minimum gift value guideline.
          </p>
        </div>
      </div>
    </Card>
  );
}
