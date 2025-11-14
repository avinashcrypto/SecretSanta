import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { toHex } from 'viem';
import { useFHEVM } from './useFHEVM';

interface EncryptionResult {
  handle: `0x${string}`;
  proof: `0x${string}`;
}

interface EncryptionError {
  message: string;
  code?: string;
}

export function useEncryption(contractAddress: string) {
  const { address } = useAccount();
  const { fhevmInstance, isInitialized } = useFHEVM();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<EncryptionError | null>(null);

  /**
   * Encrypt a uint64 value using FHEVM with retry logic
   */
  const encrypt64 = useCallback(
    async (
      value: number | bigint,
      maxRetries: number = 2
    ): Promise<EncryptionResult | null> => {
      if (!fhevmInstance || !address || !isInitialized) {
        setError({
          message: 'FHEVM not initialized or wallet not connected',
          code: 'NOT_INITIALIZED',
        });
        return null;
      }

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          setIsEncrypting(true);
          setError(null);

          // Create encrypted input
          const input = fhevmInstance.createEncryptedInput(contractAddress, address);

          // Add the value as euint64
          input.add64(Number(value));

          // Encrypt the input
          const encrypted = await input.encrypt();

          return {
            handle: toHex(encrypted.handles[0]),
            proof: toHex(encrypted.inputProof),
          };
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Encryption failed');
          console.error(`Encryption attempt ${attempt + 1} failed:`, err);

          // If not the last attempt, wait before retrying
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        } finally {
          setIsEncrypting(false);
        }
      }

      // All retries failed
      setError({
        message: lastError?.message || 'Encryption failed after multiple attempts',
        code: 'ENCRYPTION_FAILED',
      });
      return null;
    },
    [fhevmInstance, address, isInitialized, contractAddress]
  );

  /**
   * Encrypt a uint32 value using FHEVM with retry logic
   */
  const encrypt32 = useCallback(
    async (value: number, maxRetries: number = 2): Promise<EncryptionResult | null> => {
      if (!fhevmInstance || !address || !isInitialized) {
        setError({
          message: 'FHEVM not initialized or wallet not connected',
          code: 'NOT_INITIALIZED',
        });
        return null;
      }

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          setIsEncrypting(true);
          setError(null);

          // Create encrypted input
          const input = fhevmInstance.createEncryptedInput(contractAddress, address);

          // Add the value as euint32
          input.add32(value);

          // Encrypt the input
          const encrypted = await input.encrypt();

          return {
            handle: toHex(encrypted.handles[0]),
            proof: toHex(encrypted.inputProof),
          };
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Encryption failed');
          console.error(`Encryption attempt ${attempt + 1} failed:`, err);

          // If not the last attempt, wait before retrying
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        } finally {
          setIsEncrypting(false);
        }
      }

      // All retries failed
      setError({
        message: lastError?.message || 'Encryption failed after multiple attempts',
        code: 'ENCRYPTION_FAILED',
      });
      return null;
    },
    [fhevmInstance, address, isInitialized, contractAddress]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    encrypt64,
    encrypt32,
    isEncrypting,
    error,
    clearError,
    canEncrypt: isInitialized && !!fhevmInstance && !!address,
  };
}
