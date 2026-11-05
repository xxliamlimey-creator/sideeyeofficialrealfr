import React from 'react';
import { useRouter } from '../context/RouterContext';
import { SiteConfigModel } from '../types';

interface FooterProps {
  config?: SiteConfigModel | null;
}

export const Footer: React.FC<FooterProps> = ({ config }) => {
  const { navigate } = useRouter();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-900 bg-black text-zinc-400">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-zinc-900">
          {/* Brand & Mission */}
          <div className="flex items-center gap-3.5">
            <div className="h-9 w-9 overflow-hidden rounded bg-black border border-zinc-800">
              <img
                src="/assets/aistudio/316b0392-3f5b-4a07-a29a-125ff15a90ef_cd7286d7.png"
                alt="SideEye Studio Mark"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white tracking-tight">SideEye Studio</p>
              <p className="text-xs text-zinc-500">Independent software development & publishing</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
            <button
              onClick={() => navigate('/')}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/apps')}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Application Library
            </button>
            <button
              onClick={() => navigate('/about')}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              About Studio
            </button>
            {config?.contactEmail && (
              <a
                href={`mailto:${config.contactEmail}`}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Contact
              </a>
            )}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 text-xs">
            {config?.socialLinks?.github && (
              <a
                href={config.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
              >
                GitHub
              </a>
            )}
            {config?.socialLinks?.twitter && (
              <a
                href={config.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
              >
                X (Twitter)
              </a>
            )}
            {config?.socialLinks?.discord && (
              <a
                href={config.socialLinks.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
              >
                Discord
              </a>
            )}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-4">
          <p>© {currentYear} SideEye Studio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Windows · Android · Web · Linux</span>
            <span>Zero telemetry standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
