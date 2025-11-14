import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Gift, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useSecretSanta } from '../../hooks/useSecretSanta';
import { useFHEVM } from '../../hooks/useFHEVM';
import { useEncryption } from '../../hooks/useEncryption';
import { CONTRACT_ADDRESSES } from '../../types/contracts';
import { parseEther } from 'viem';

export function GiftSubmission() {
  const { address, isConnected } = useAccount();
  const { submitGift, isPending, isConfirming, isConfirmed, error } = useSecretSanta();
  const { isInitialized } = useFHEVM();
  const {
    encrypt64,
    isEncrypting,
    error: encryptError,
    canEncrypt,
  } = useEncryption(CONTRACT_ADDRESSES.SECRET_SANTA as string);

  const [giftValue, setGiftValue] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [metadataURI, setMetadataURI] = useState('');

  const handleSubmit = async () => {
    if (!canEncrypt || !address || !giftValue) return;

    try {
      // Convert ETH to wei
      const valueInWei = parseEther(giftValue);

      // Encrypt the gift value using enhanced encryption hook
      const encrypted = await encrypt64(valueInWei);

      if (!encrypted) {
        throw new Error('Encryption failed');
      }

      // Use provided metadata URI or create a simple one
      const uri = metadataURI || `data:text/plain,${encodeURIComponent(giftMessage)}`;

      // Submit encrypted gift to contract
      await submitGift(encrypted.handle, encrypted.proof, uri);

      // Reset form on success
      setGiftValue('');
      setGiftMessage('');
      setMetadataURI('');
    } catch (err) {
      console.error('Gift submission failed:', err);
    }
  };

  if (!isConnected) {
    return (
      <Card className="text-center py-8">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
        <h3 className="text-xl font-semibold mb-2">Wallet Not Connected</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please connect your wallet to submit a gift
        </p>
      </Card>
    );
  }

  if (!isInitialized) {
    return (
      <Card className="text-center py-8">
        <Lock className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-pulse" />
        <h3 className="text-xl font-semibold mb-2">Initializing Encryption...</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Setting up FHEVM for secure gift submission
        </p>
      </Card>
    );
  }

  if (isConfirmed) {
    return (
      <Card className="text-center py-8 border-2 border-evergreen-500/30">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-evergreen-500 animate-bounce" />
        <h3 className="text-xl font-semibold mb-2 text-evergreen-500">Gift Submitted!</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your encrypted gift has been recorded on-chain 🎁
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
            <Gift className="w-6 h-6 text-santa-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Submit Your Gift</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Encrypt and submit your gift value
            </p>
          </div>
        </div>

        {/* Encryption Status */}
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-500" />
            <p className="text-sm text-purple-500 font-medium">
              ✓ FHE Encryption Ready
            </p>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Your gift value will be encrypted before submission
          </p>
        </div>

        {/* Gift Value Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Gift Value (ETH)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            placeholder="0.01"
            value={giftValue}
            onChange={(e) => setGiftValue(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-santa-500"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            This value will be encrypted and hidden until reveal
          </p>
        </div>

        {/* Gift Message Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Gift Message (Optional)
          </label>
          <textarea
            placeholder="Write a festive message for your recipient..."
            value={giftMessage}
            onChange={(e) => setGiftMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-santa-500 resize-none"
          />
        </div>

        {/* IPFS URI Input (Advanced) */}
        <details className="group">
          <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-santa-500 transition-colors">
            Advanced: Custom Metadata URI
          </summary>
          <div className="mt-3">
            <input
              type="text"
              placeholder="ipfs://Qm..."
              value={metadataURI}
              onChange={(e) => setMetadataURI(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-santa-500 text-sm"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Optional: Provide an IPFS URI for gift metadata
            </p>
          </div>
        </details>

        {/* Submit Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={!giftValue || isPending || isConfirming || isEncrypting}
          isLoading={isPending || isConfirming || isEncrypting}
        >
          {isEncrypting
            ? 'Encrypting Gift...'
            : isPending
            ? 'Waiting for Approval...'
            : isConfirming
            ? 'Confirming...'
            : 'Submit Encrypted Gift'}
        </Button>

        {/* Error Message */}
        {(error || encryptError) && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-500">
                  {encryptError ? 'Encryption Failed' : 'Submission Failed'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {encryptError?.message || error?.message || 'Please try again'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Privacy Notice:</strong> Your gift value is encrypted using Fully Homomorphic
            Encryption (FHE) and remains completely private until the reveal phase. Not even the
            contract owner can see your gift value.
          </p>
        </div>
      </div>
    </Card>
  );
}
