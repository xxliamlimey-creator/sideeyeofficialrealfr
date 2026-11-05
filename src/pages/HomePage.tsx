import React from 'react';
import { useRouter } from '../context/RouterContext';
import { AppModel, SiteConfigModel } from '../types';
import { ArrowRight, Monitor, Smartphone, Gamepad2, Globe, Sparkles, Download, CheckCircle2 } from 'lucide-react';

interface HomePageProps {
  featuredApps: AppModel[];
  config: SiteConfigModel | null;
  loading: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ featuredApps, config, loading }) => {
  const { navigate } = useRouter();

  const headline = config?.headline || 'Software made with a different perspective.';
  const subheadline =
    config?.subheadline ||
    'SideEye Studio creates applications, games, and digital experiences designed to make technology more enjoyable and accessible.';

  const platforms = [
    { name: 'Windows Applications', icon: Monitor, desc: 'Native 64-bit desktop executables and system utilities' },
    { name: 'Android Software', icon: Smartphone, desc: 'Responsive mobile utilities and tactile mobile gaming' },
    { name: 'PC & Mobile Games', icon: Gamepad2, desc: 'Atmospheric probability games and interactive strategy' },
    { name: 'Web Applications', icon: Globe, desc: 'Zero-latency web utilities and cloud workspaces' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative border-b border-zinc-900 bg-black pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden">
        {/* Subtle grid background texture */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '32px 32px' }} 
        />

        <div className="relative mx-auto max-w-5xl px-6 lg:px-8 text-center">
          {/* Logo Emblem in Hero */}
          <div className="mx-auto mb-8 h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-1 shadow-2xl transition-transform duration-300 hover:scale-105">
            <img
              src="/assets/aistudio/Stealthy_Eye_Emblem_40da80da.png"
              alt="SideEye Studio Official Emblem"
              className="h-full w-full object-cover rounded-lg"
            />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-1 text-xs font-mono text-zinc-400 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            INDEPENDENT SOFTWARE STUDIO
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl max-w-3xl mx-auto leading-[1.12]">
            {headline}
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            {subheadline}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/apps')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3.5 text-sm font-semibold text-black hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-sm"
            >
              Explore Software Library
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/about')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/80 px-6 py-3.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all active:scale-[0.98]"
            >
              About the Studio
            </button>
          </div>

          {/* Quick Platform Pillars */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            {platforms.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.name} className="p-4 rounded-lg border border-zinc-900 bg-zinc-950/60">
                  <Icon className="h-5 w-5 text-zinc-400 mb-2" />
                  <div className="text-xs font-semibold text-zinc-200">{p.name}</div>
                  <div className="text-[11px] text-zinc-500 mt-1 line-clamp-2">{p.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Applications Section */}
      <section className="border-b border-zinc-900 bg-[#09090b] py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="text-xs font-mono tracking-wider uppercase text-zinc-500 mb-2">
                Flagship Releases
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Featured Applications
              </h2>
            </div>
            <button
              onClick={() => navigate('/apps')}
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              View all products ({featuredApps.length})
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-72 rounded-xl border border-zinc-800/60 bg-zinc-900/30 animate-pulse" />
              ))}
            </div>
          ) : featuredApps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => navigate(`/apps/${app.slug || app.id}`)}
                  className="group cursor-pointer flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-950 p-6 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-900/40"
                >
                  <div>
                    {/* Top Header: Icon & Platforms */}
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="h-14 w-14 overflow-hidden rounded-xl border border-zinc-800 bg-black flex-shrink-0">
                        <img
                          src={app.iconUrl || '/assets/aistudio/Stealthy_Eye_Emblem_40da80da.png'}
                          alt={app.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {app.platforms?.slice(0, 2).map((p) => (
                          <span
                            key={p}
                            className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-800"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-lg font-bold text-white group-hover:text-zinc-100 transition-colors">
                        {app.name}
                      </h3>
                      {app.version && (
                        <span className="text-[11px] font-mono text-zinc-500">v{app.version}</span>
                      )}
                    </div>

                    <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
                      {app.shortDescription}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <Download className="h-3.5 w-3.5" />
                      {app.downloadCount ? `${app.downloadCount.toLocaleString()} downloads` : 'Official release'}
                    </span>
                    <span className="font-semibold text-white group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                      Details
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-zinc-600 mb-3" />
              <p className="text-sm font-medium text-zinc-300">No applications currently marked as featured.</p>
              <p className="text-xs text-zinc-500 mt-1">Visit the app library to explore all software.</p>
              <button
                onClick={() => navigate('/apps')}
                className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800"
              >
                Browse All Applications
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Studio Ethos / Engineering Section */}
      <section className="bg-black py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-mono tracking-wider uppercase text-zinc-500 mb-3">
                Behind the Software
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
                Engineered for responsiveness, durability, and focus.
              </h2>
              <p className="text-base text-zinc-400 leading-relaxed mb-6">
                At SideEye Studio, we build native applications and games from first principles. We reject the bloated web wrappers and resource-hungry background services that plague modern software.
              </p>
              <div className="space-y-3.5">
                {[
                  'Clean native binaries with minimal memory footprints',
                  'Deterministic physics engines for game experiences',
                  'Zero unnecessary telemetry or intrusive data tracking',
                  'Offline-first architectures with private local persistence'
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-zinc-400 mt-1 flex-shrink-0" />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <button
                  onClick={() => navigate('/about')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white underline underline-offset-4 decoration-zinc-600 hover:decoration-white transition-colors"
                >
                  Read the full studio manifesto
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-zinc-700" />
                  <div className="h-3 w-3 rounded-full bg-zinc-700" />
                  <div className="h-3 w-3 rounded-full bg-zinc-700" />
                </div>
                <span className="font-mono text-xs text-zinc-500">sideeye-engine // v2.4</span>
              </div>
              <div className="font-mono text-xs text-zinc-400 space-y-2">
                <p className="text-zinc-600">// SideEye Studio release build pipeline</p>
                <p><span className="text-zinc-200">target:</span> [ "x86_64-pc-windows-msvc", "aarch64-linux-android" ]</p>
                <p><span className="text-zinc-200">optimization:</span> "speed + zero-telemetry"</p>
                <p><span className="text-zinc-200">status:</span> verified publisher signature</p>
                <div className="p-3 my-3 rounded bg-zinc-900/70 border border-zinc-800 text-zinc-300">
                  "Every application is built to respect user autonomy, screen real-estate, and system resources."
                </div>
                <p className="text-emerald-400">✓ All packages signed and ready for direct distribution.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
