import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../types/contracts';
import type { GameInfo } from '../types/contracts';
import { secretSantaABI } from '../lib/abi';

export function useSecretSanta() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // Read functions
  const { data: gameInfoRaw } = useReadContract({
    address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
    abi: secretSantaABI,
    functionName: 'getGameInfo',
  });

  // Convert array response to GameInfo object
  const gameInfo: GameInfo | undefined = gameInfoRaw
    ? {
        phase: (gameInfoRaw as any)[0],
        numParticipants: Number((gameInfoRaw as any)[1]),
        regDeadline: (gameInfoRaw as any)[2],
        subDeadline: (gameInfoRaw as any)[3],
        revTime: (gameInfoRaw as any)[4],
      }
    : undefined;

  const { data: participants } = useReadContract({
    address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
    abi: secretSantaABI,
    functionName: 'getParticipants',
  }) as { data: string[] | undefined };

  const { data: participantCount } = useReadContract({
    address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
    abi: secretSantaABI,
    functionName: 'participantCount',
  }) as { data: bigint | undefined };

  const { data: giftsSubmittedCount } = useReadContract({
    address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
    abi: secretSantaABI,
    functionName: 'getGiftsSubmittedCount',
  }) as { data: bigint | undefined };

  // Write functions
  const register = async (value: bigint) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
      abi: secretSantaABI,
      functionName: 'register',
      value,
    });
  };

  const submitGift = async (
    encryptedGiftValue: `0x${string}`,
    inputProof: `0x${string}`,
    metadataURI: string
  ) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
      abi: secretSantaABI,
      functionName: 'submitGift',
      args: [encryptedGiftValue, inputProof, metadataURI],
    });
  };

  return {
    // Contract state
    gameInfo,
    participants,
    participantCount,
    giftsSubmittedCount,

    // Write functions
    register,
    submitGift,

    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
}
