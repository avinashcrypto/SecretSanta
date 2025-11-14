import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Gift, User, ExternalLink, Sparkles } from 'lucide-react';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../../types/contracts';
import { secretSantaABI } from '../../lib/abi';
import { formatAddress, formatEth } from '../../utils/format';

interface GiftMatch {
  giver: string;
  recipient: string;
  giftValue: bigint;
  metadataURI: string;
}

export function RevealResults() {
  const [matches, setMatches] = useState<GiftMatch[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get participants list
  const { data: participants } = useReadContract({
    address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
    abi: secretSantaABI,
    functionName: 'getParticipants',
  }) as { data: string[] | undefined };

  // Get game info to check phase
  const { data: gameInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.SECRET_SANTA as `0x${string}`,
    abi: secretSantaABI,
    functionName: 'getGameInfo',
  });

  // Load all revealed matches
  useEffect(() => {
    const loadMatches = async () => {
      if (!participants || participants.length === 0) return;

      const matchesData: GiftMatch[] = [];

      // Query each participant's revealed recipient and gift
      for (const participant of participants) {
        try {
          // This would need to be implemented in the contract
          // For now, we'll use placeholder data structure
          // In production, you'd call something like:
          // const recipient = await contract.revealedRecipients(participant);
          // const gift = await contract.gifts(participant);

          // Placeholder - will be replaced with actual contract calls
          matchesData.push({
            giver: participant,
            recipient: participant, // Placeholder
            giftValue: BigInt(0),
            metadataURI: '',
          });
        } catch (err) {
          console.error(`Failed to load match for ${participant}:`, err);
        }
      }

      setMatches(matchesData);
    };

    if (gameInfo && participants) {
      loadMatches();
    }
  }, [participants, gameInfo]);

  // Animate reveal one by one
  useEffect(() => {
    if (matches.length > 0 && revealedCount < matches.length && !isAnimating) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setRevealedCount((prev) => prev + 1);
        setIsAnimating(false);
      }, 800); // 800ms between each reveal

      return () => clearTimeout(timer);
    }
  }, [matches.length, revealedCount, isAnimating]);

  if (!participants || participants.length === 0) {
    return (
      <Card className="text-center py-12">
        <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">No Participants Yet</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Waiting for players to join the game
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-santa-500 to-evergreen-500 text-white">
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <Sparkles className="w-16 h-16 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-2">Secret Santa Revealed!</h2>
          <p className="text-white/90">
            Discover who your Secret Santa was
          </p>
          <div className="mt-4 text-sm text-white/80">
            {revealedCount} of {matches.length} matches revealed
          </div>
        </div>
      </Card>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {matches.slice(0, revealedCount).map((match, index) => (
            <MatchCard key={match.giver} match={match} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* Loading placeholder for unrevealed matches */}
      {revealedCount < matches.length && (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center py-8 opacity-50">
            <Gift className="w-12 h-12 mx-auto mb-3 text-gray-400 animate-pulse" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Revealing next match...
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

interface MatchCardProps {
  match: GiftMatch;
  index: number;
}

function MatchCard({ match, index }: MatchCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // Auto-flip after a short delay
    const timer = setTimeout(() => setIsFlipped(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateY: -90 }}
      animate={{ opacity: 1, y: 0, rotateY: isFlipped ? 0 : -90 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <Card className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-santa-500/5 to-evergreen-500/5" />

        <div className="relative space-y-4">
          {/* Giver */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-santa-500/10">
              <User className="w-5 h-5 text-santa-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">From</p>
              <p className="font-mono text-sm font-medium truncate">
                {formatAddress(match.giver)}
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Gift className="w-8 h-8 text-evergreen-500" />
            </motion.div>
          </div>

          {/* Recipient */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-evergreen-500/10">
              <User className="w-5 h-5 text-evergreen-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">To</p>
              <p className="font-mono text-sm font-medium truncate">
                {formatAddress(match.recipient)}
              </p>
            </div>
          </div>

          {/* Gift Details */}
          {match.giftValue > 0n && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Gift Value</span>
                <span className="text-lg font-bold text-evergreen-500">
                  {formatEth(match.giftValue)} ETH
                </span>
              </div>
            </div>
          )}

          {/* Metadata Link */}
          {match.metadataURI && (
            <div className="pt-2">
              <a
                href={match.metadataURI.startsWith('ipfs://')
                  ? `https://ipfs.io/ipfs/${match.metadataURI.slice(7)}`
                  : match.metadataURI}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
              >
                <span>View Message</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
