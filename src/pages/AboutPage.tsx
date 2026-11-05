import React from 'react';
import { useRouter } from '../context/RouterContext';
import { SiteConfigModel } from '../types';
import { 
  ArrowRight, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  Eye, 
  Monitor, 
  Smartphone, 
  Gamepad2, 
  Globe,
  Mail
} from 'lucide-react';

interface AboutPageProps {
  config: SiteConfigModel | null;
}

export const AboutPage: React.FC<AboutPageProps> = ({ config }) => {
  const { navigate } = useRouter();

  const fullAbout = config?.aboutFull || 
    `SideEye Studio is an independent software development company established to create specialized applications, games, and digital utilities with uncompromising performance.
    
    We build software for individuals and teams who value speed, deliberate interface design, and deep respect for user autonomy. Rather than wrapping websites into bloated system trays, we engineer native solutions built from the ground up for their respective platforms.`;

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7]">
      {/* Hero Header */}
      <section className="border-b border-zinc-900 bg-zinc-950/70 pt-20 pb-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mx-auto mb-6 h-20 w-20 overflow-hidden rounded-2xl border border-zinc-800 bg-black p-1 shadow-2xl">
            <img
              src="/assets/aistudio/Stealthy_Eye_Emblem_40da80da.png"
              alt="SideEye Studio"
              className="h-full w-full object-cover rounded-xl"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 uppercase tracking-widest mb-3">
            Company Overview
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            About SideEye Studio
          </h1>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Software, games, and developer utilities engineered with precision, native speed, and an independent perspective.
          </p>
        </div>
      </section>

      {/* Main Philosophy Story */}
      <section className="py-16 border-b border-zinc-900">
        <div className="mx-auto max-w-3xl px-6 space-y-8 text-base text-zinc-300 leading-relaxed font-normal">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-8 text-sm text-zinc-300 leading-relaxed whitespace-pre-line border-l-4 border-l-white">
            {fullAbout}
          </div>

          <div className="space-y-6 pt-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Our Core Tenets</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-6">
                <Cpu className="h-5 w-5 text-zinc-300 mb-3" />
                <h3 className="text-base font-bold text-white mb-1.5">Native Performance</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We reject the 300MB RAM desktop wrapper. Our Windows executables and Android packages are built to launch in milliseconds and run with negligible idle resource consumption.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-6">
                <ShieldCheck className="h-5 w-5 text-emerald-400 mb-3" />
                <h3 className="text-base font-bold text-white mb-1.5">Zero Telemetry Standard</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your work, gaming records, and notes belong strictly to you. SideEye Studio software contains zero invasive user tracking, zero data scraping, and zero third-party adware.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-6">
                <Eye className="h-5 w-5 text-zinc-300 mb-3" />
                <h3 className="text-base font-bold text-white mb-1.5">Deliberate Aesthetics</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  No generic templates or ephemeral design fads. We craft refined, dark-mode interfaces with clear typography and tactile feedback inspired by precision physical instruments.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-6">
                <Terminal className="h-5 w-5 text-zinc-300 mb-3" />
                <h3 className="text-base font-bold text-white mb-1.5">Direct Distribution</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Clean, portable, and signed binaries. Whether you need a portable Windows archive or a standalone Android APK, we provide direct downloads without mandatory walled-garden locks.
                </p>
              </div>
            </div>
          </div>

          {/* Development Disciplines */}
          <div className="space-y-6 pt-10 border-t border-zinc-900">
            <h2 className="text-2xl font-bold text-white tracking-tight">Active Disciplines</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-4 p-4 rounded-lg border border-zinc-900 bg-zinc-950/60">
                <Monitor className="h-5 w-5 text-zinc-400 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-white">Windows Desktop</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">High-performance utilities, system monitors, and automation tools.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg border border-zinc-900 bg-zinc-950/60">
                <Smartphone className="h-5 w-5 text-zinc-400 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-white">Android Software</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Tactile utilities, offline scratchpads, and mobile game ports.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg border border-zinc-900 bg-zinc-950/60">
                <Gamepad2 className="h-5 w-5 text-zinc-400 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-white">PC & Mobile Games</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Tactical probability strategy, puzzle experiences, and simulated physics.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg border border-zinc-900 bg-zinc-950/60">
                <Globe className="h-5 w-5 text-zinc-400 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-white">Web Applications</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Zero-latency cloud workspaces and public developer registries.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact and Inquiries */}
          <div className="pt-10 border-t border-zinc-900">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-base font-bold text-white">Direct Inquiries</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  For licensing questions, custom developer inquiries, or bug reports:
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs font-mono text-white">
                  <Mail className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{config?.contactEmail || 'contact@sideeyestudio.com'}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/apps')}
                className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-bold text-black hover:bg-zinc-200 transition-colors"
              >
                Browse Our Software
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
