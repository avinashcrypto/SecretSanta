import { Layout } from './components/layout/Layout';
import { Card } from './components/ui/Card';
import { Gift } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useSecretSanta } from './hooks/useSecretSanta';
import { GamePhase } from './types/contracts';
import { GameDashboard } from './components/game/GameDashboard';
import { RegisterForm } from './components/game/RegisterForm';
import { ParticipantList } from './components/game/ParticipantList';
import { RecipientReveal } from './components/game/RecipientReveal';
import { GiftSubmission } from './components/game/GiftSubmission';
import { GameTimeline } from './components/game/GameTimeline';
import { AdminPanel } from './components/game/AdminPanel';
import { RevealResults } from './components/game/RevealResults';

function App() {
  const { isConnected } = useAccount();
  const { gameInfo } = useSecretSanta();

  const currentPhase = gameInfo?.phase;

  // Debug logging
  console.log('App Debug:', {
    isConnected,
    gameInfo,
    currentPhase,
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-block">
            <div className="relative">
              <div className="absolute inset-0 bg-christmas-gradient blur-3xl opacity-30 animate-pulse" />
              <h1 className="relative text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
                🎅 Secret Santa FHEVM
              </h1>
            </div>
          </div>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Experience the magic of gift exchange with cryptographic privacy powered by FHE
          </p>
        </div>

        {/* Main Dashboard */}
        <GameDashboard />

        {/* Welcome / Registration Section */}
        {!isConnected ? (
          <Card className="text-center py-12">
            <Gift className="w-16 h-16 mx-auto mb-4 text-santa-500" />
            <h2 className="text-2xl font-bold mb-2">Welcome to Secret Santa!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connect your wallet using the button above to join the game
            </p>
          </Card>
        ) : (
          <>
            {/* Phase-specific content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Actions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Admin Panel - Always visible to owner */}
                <AdminPanel />

                {/* Registration Phase */}
                {currentPhase === GamePhase.Registration && <RegisterForm />}

                {/* Matching Phase */}
                {currentPhase === GamePhase.Matching && (
                  <Card className="text-center py-12">
                    <Gift className="w-16 h-16 mx-auto mb-4 text-purple-500 animate-pulse" />
                    <h2 className="text-2xl font-bold mb-2">Matching in Progress</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Encrypted matching is being performed. You can now query your recipient!
                    </p>
                  </Card>
                )}

                {/* Gift Submission Phase */}
                {currentPhase === GamePhase.GiftSubmission && (
                  <>
                    <RecipientReveal />
                    <GiftSubmission />
                  </>
                )}

                {/* Waiting Reveal Phase */}
                {currentPhase === GamePhase.WaitingReveal && (
                  <Card className="text-center py-12">
                    <Gift className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                    <h2 className="text-2xl font-bold mb-2">Waiting for Reveal</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      All gifts have been submitted! Waiting for the reveal time.
                    </p>
                  </Card>
                )}

                {/* Revealed Phase - Show Results */}
                {currentPhase === GamePhase.Revealed && <RevealResults />}

                {/* Features Section - Show when not in active phase */}
                {currentPhase === undefined && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card hover>
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-santa-500" />
                        True Privacy
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Your gift recipient remains encrypted on-chain until the reveal phase. No
                        one can see matches, not even the contract owner.
                      </p>
                    </Card>

                    <Card hover>
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-evergreen-500" />
                        Cryptographic Fairness
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Matching uses encrypted random offsets to ensure fair, circular gift
                        exchange with mathematical guarantees.
                      </p>
                    </Card>
                  </div>
                )}
              </div>

              {/* Right Column - Info & Timeline */}
              <div className="space-y-6">
                <ParticipantList />
                <GameTimeline />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default App;
