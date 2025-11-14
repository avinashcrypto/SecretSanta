import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Eye, EyeOff, User, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useFHEVM } from '../../hooks/useFHEVM';
import { useDecryption } from '../../hooks/useDecryption';
import { CONTRACT_ADDRESSES } from '../../types/contracts';
import { secretSantaABI } from '../../lib/abi';
import { formatAddress } from '../../utils/format';

export function RecipientReveal() {
  const { address, isConnected } = useAccount();
  const { fhevmInstance, isInitialized } = useFHEVM();
  const { decrypt32, isDecrypting, error: decryptError } = useDecryption(
    CONTRACT_ADDRESSES.SECRET_SANTA as string
  );
  const { writeContractAsync } = useWriteContract();
  const [recipientIndex, setRecipientIndex] = useState<number | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get participants list
  const { data: participants } = useReadContract({
    address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
    abi: secretSantaABI,
    functionName: 'getParticipants',
  }) as { data: string[] | undefined };

  const handleReveal = async () => {
    if (!fhevmInstance || !address || !isConnected || !participants) {
      setError('Prerequisites not met: wallet, FHEVM, or participants not available');
      return;
    }

    try {
      setError(null);

      // Step 1: Call getMyRecipientEncrypted() to get the encrypted handle
      // This also grants ACL permission for decryption
      const encryptedHandle = await writeContractAsync({
        address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
        abi: secretSantaABI,
        functionName: 'getMyRecipientEncrypted',
      });

      if (!encryptedHandle) {
        throw new Error('Failed to get encrypted recipient handle');
      }

      // Step 2: Decrypt the encrypted recipient index using FHE
      const decryptedIndex = await decrypt32(encryptedHandle);

      if (decryptedIndex === null) {
        throw new Error('Decryption failed');
      }

      // Step 3: Look up the recipient address from participants array
      if (decryptedIndex >= participants.length) {
        throw new Error('Invalid recipient index');
      }

      setRecipientIndex(decryptedIndex);
      setRecipientAddress(participants[decryptedIndex]);
    } catch (err) {
      console.error('Reveal failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to reveal recipient';
      setError(errorMessage);
    }
  };

  if (!isConnected) {
    return (
      <Card className="text-center py-8">
        <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">Wallet Not Connected</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your wallet to see your recipient
        </p>
      </Card>
    );
  }

  if (!isInitialized) {
    return (
      <Card className="text-center py-8">
        <Lock className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-pulse" />
        <h3 className="text-xl font-semibold mb-2">Initializing Decryption...</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Setting up FHEVM to reveal your recipient
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10">
            <User className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Your Recipient</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Decrypt to see who you're giving to
            </p>
          </div>
        </div>

        {/* Reveal Area */}
        {recipientAddress === null ? (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-santa-500/20 to-evergreen-500/20 blur-2xl" />
            <div className="relative p-8 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
              <EyeOff className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold mb-2">Recipient Hidden</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Your recipient information is encrypted on-chain
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={handleReveal}
                disabled={isDecrypting || !isInitialized}
                isLoading={isDecrypting}
              >
                <Eye className="w-5 h-5" />
                {isDecrypting ? 'Decrypting...' : 'Reveal My Recipient'}
              </Button>

              {/* Error Display */}
              {(error || decryptError) && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-500 mb-1">Decryption Failed</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {error || decryptError?.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-christmas-gradient opacity-10 animate-pulse" />
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-santa-500/10 to-evergreen-500/10 border-2 border-evergreen-500/30">
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="w-12 h-12 text-evergreen-500 animate-pulse" />
              </div>

              <h4 className="text-center text-lg font-semibold mb-4">
                You're giving a gift to:
              </h4>

              {/* Recipient Info */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Address</p>
                  <p className="font-mono text-sm break-all">{recipientAddress}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Position</p>
                  <p className="text-2xl font-bold">Player #{(recipientIndex || 0) + 1}</p>
                </div>
              </div>

              {/* Next Step */}
              <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Next Step:</strong> Submit your encrypted gift for{' '}
                  <span className="font-mono">{formatAddress(recipientAddress)}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-purple-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-500 mb-1">End-to-End Encrypted</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Your recipient information is stored encrypted on-chain and can only be decrypted by
                you using your wallet signature. No one else can see who you're matched with.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
