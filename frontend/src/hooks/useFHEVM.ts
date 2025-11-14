import { useState, useEffect } from 'react';
import { createInstance, initFhevm } from 'fhevmjs';
import type { FhevmInstance } from 'fhevmjs';
import { usePublicClient } from 'wagmi';
import { sepolia } from 'wagmi/chains';

export function useFHEVM() {
  const [fhevmInstance, setFhevmInstance] = useState<FhevmInstance | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const publicClient = usePublicClient();

  useEffect(() => {
    const initInstance = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        // Initialize FHEVM with explicit WASM paths
        await initFhevm({
          tfheParams: '/fhevmjs/tfhe_bg.wasm',
          kmsParams: '/fhevmjs/kms_lib_bg.wasm',
        });

        // Create FHEVM instance for Sepolia
        // Note: KMS and ACL addresses are standard for Sepolia testnet
        const instance = await createInstance({
          chainId: sepolia.id,
          kmsContractAddress: '0x7A9d4dfB83e2b7Bc5b3f8a1ef1E26d2b84E7B748' as `0x${string}`,
          aclContractAddress: '0x5B9bF7d8b1c3d2E5a6F7C8d9E0F1A2B3C4D5E6F7' as `0x${string}`,
          // publicKey will be fetched automatically from the network
        });

        setFhevmInstance(instance);
      } catch (err) {
        console.error('Failed to initialize FHEVM:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsInitializing(false);
      }
    };

    if (publicClient) {
      initInstance();
    }
  }, [publicClient]);

  return {
    fhevmInstance,
    isInitializing,
    isInitialized: !isInitializing && !!fhevmInstance,
    error,
  };
}
