import { Github, Twitter, FileText } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 glass mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-santa-600 dark:text-santa-400">
              🎄 Secret Santa FHEVM
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A privacy-preserving gift exchange game built on Zama's Fully Homomorphic Encryption
              Virtual Machine.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://docs.zama.ai/fhevm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-santa-500 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  FHEVM Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/zama-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-santa-500 transition-colors flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  Zama GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Connect</h3>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Built with ❤️ using{' '}
            <a
              href="https://www.zama.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-santa-500 hover:text-santa-600 transition-colors"
            >
              Zama's FHEVM
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
