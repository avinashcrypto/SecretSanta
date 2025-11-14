import { formatEther } from 'viem';

/**
 * Format address to short version
 * @example 0x1234...5678
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format ETH value with decimals
 */
export function formatEth(value: bigint | undefined, decimals = 4): string {
  if (!value) return '0';
  const formatted = formatEther(value);
  const num = parseFloat(formatted);
  return num.toFixed(decimals);
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: bigint | number): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  return new Date(ts * 1000).toLocaleString();
}

/**
 * Format countdown time
 */
export function formatCountdown(timestamp: bigint | number): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  const now = Date.now() / 1000;
  const diff = ts - now;

  if (diff <= 0) return 'Ended';

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
