import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Gift } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 glass-strong">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-christmas-gradient blur-xl opacity-50" />
              <div className="relative bg-gradient-to-br from-santa-50 to-evergreen-50 rounded-2xl p-2 border border-santa-200">
                <Gift className="w-6 h-6 text-santa-600" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-santa-600 dark:text-santa-400">
                🎅 Secret Santa
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Powered by FHEVM</p>
            </div>
          </div>

          {/* Wallet Connect */}
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
