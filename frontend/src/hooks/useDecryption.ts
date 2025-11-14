import { useState, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { toHex } from 'viem';
import { useFHEVM } from './useFHEVM';

interface DecryptionError {
  message: string;
  code?: string;
}

export function useDecryption(contractAddress: string) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { fhevmInstance, isInitialized } = useFHEVM();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<DecryptionError | null>(null);

  /**
   * Decrypt a uint32 encrypted value with retry logic
   */
  const decrypt32 = useCallback(
    async (handle: bigint | string, maxRetries: number = 2): Promise<number | null> => {
      if (!fhevmInstance || !address || !walletClient || !isInitialized) {
        setError({
          message: 'FHEVM not initialized, wallet not connected, or no wallet client',
          code: 'NOT_INITIALIZED',
        });
        return null;
      }

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          setIsDecrypting(true);
          setError(null);

          // Convert handle to bigint if it's a string
          const handleBigInt = typeof handle === 'string' ? BigInt(handle) : handle;

          // Get public key
          const publicKeyData = fhevmInstance.getPublicKey();
          if (!publicKeyData) {
            throw new Error('Failed to get public key');
          }
          const { publicKey } = publicKeyData;
          const publicKeyHex = toHex(publicKey);

          // Create EIP712 signature request
          const eip712 = fhevmInstance.createEIP712(publicKeyHex, contractAddress);

          // Request user signature (only once, don't retry if user rejects)
          const signature = await walletClient.signTypedData({
            account: address,
            domain: eip712.domain as any,
            types: eip712.types,
            primaryType: 'Reencrypt',
            message: eip712.message,
          });

          // Decrypt the value
          const decrypted = await fhevmInstance.reencrypt(
            handleBigInt,
            address,
            publicKeyHex,
            signature,
            contractAddress,
            address
          );

          return Number(decrypted);
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Decryption failed');
          console.error(`Decryption attempt ${attempt + 1} failed:`, err);

          // Don't retry if user rejected signature
          if (lastError.message.includes('rejected') || lastError.message.includes('denied')) {
            setError({
              message: 'User rejected signature request',
              code: 'USER_REJECTED',
            });
            return null;
          }

          // If not the last attempt, wait before retrying
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        } finally {
          setIsDecrypting(false);
        }
      }

      // All retries failed
      setError({
        message: lastError?.message || 'Decryption failed after multiple attempts',
        code: 'DECRYPTION_FAILED',
      });
      return null;
    },
    [fhevmInstance, address, walletClient, isInitialized, contractAddress]
  );

  /**
   * Decrypt a uint64 encrypted value with retry logic
   */
  const decrypt64 = useCallback(
    async (handle: bigint | string, maxRetries: number = 2): Promise<bigint | null> => {
      if (!fhevmInstance || !address || !walletClient || !isInitialized) {
        setError({
          message: 'FHEVM not initialized, wallet not connected, or no wallet client',
          code: 'NOT_INITIALIZED',
        });
        return null;
      }

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          setIsDecrypting(true);
          setError(null);

          // Convert handle to bigint if it's a string
          const handleBigInt = typeof handle === 'string' ? BigInt(handle) : handle;

          // Get public key
          const publicKeyData = fhevmInstance.getPublicKey();
          if (!publicKeyData) {
            throw new Error('Failed to get public key');
          }
          const { publicKey } = publicKeyData;
          const publicKeyHex = toHex(publicKey);

          // Create EIP712 signature request
          const eip712 = fhevmInstance.createEIP712(publicKeyHex, contractAddress);

          // Request user signature
          const signature = await walletClient.signTypedData({
            account: address,
            domain: eip712.domain as any,
            types: eip712.types,
            primaryType: 'Reencrypt',
            message: eip712.message,
          });

          // Decrypt the value
          const decrypted = await fhevmInstance.reencrypt(
            handleBigInt,
            address,
            publicKeyHex,
            signature,
            contractAddress,
            address
          );

          return BigInt(decrypted);
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Decryption failed');
          console.error(`Decryption attempt ${attempt + 1} failed:`, err);

          // Don't retry if user rejected signature
          if (lastError.message.includes('rejected') || lastError.message.includes('denied')) {
            setError({
              message: 'User rejected signature request',
              code: 'USER_REJECTED',
            });
            return null;
          }

          // If not the last attempt, wait before retrying
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        } finally {
          setIsDecrypting(false);
        }
      }

      // All retries failed
      setError({
        message: lastError?.message || 'Decryption failed after multiple attempts',
        code: 'DECRYPTION_FAILED',
      });
      return null;
    },
    [fhevmInstance, address, walletClient, isInitialized, contractAddress]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    decrypt32,
    decrypt64,
    isDecrypting,
    error,
    clearError,
    canDecrypt: isInitialized && !!fhevmInstance && !!address && !!walletClient,
  };
}
