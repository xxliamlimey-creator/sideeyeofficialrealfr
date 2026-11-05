import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { AppModel, DownloadItem } from '../types';
import { fetchAppBySlugOrId } from '../lib/db';
import { triggerDownload } from '../lib/downloadHelper';
import { 
  ArrowLeft, 
  Download, 
  Monitor, 
  Smartphone, 
  Globe, 
  Calendar, 
  Tag as TagIcon, 
  CheckCircle, 
  ShieldCheck, 
  HardDrive, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Maximize2,
  X
} from 'lucide-react';

interface AppDetailPageProps {
  appId: string;
}

export const AppDetailPage: React.FC<AppDetailPageProps> = ({ appId }) => {
  const { navigate } = useRouter();
  const [app, setApp] = useState<AppModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAppBySlugOrId(appId);
        if (isMounted) setApp(data);
      } catch (err) {
        console.error('Error fetching app details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [appId]);

  const handleDownload = async (item: DownloadItem) => {
    if (!app) return;
    setDownloadingId(item.id);
    setDownloadSuccess(null);
    try {
      await triggerDownload(app.id, item);
      setDownloadSuccess(`Downloaded ${item.fileName}`);
      // Increment local count immediately for snappy UX
      setApp((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          downloadCount: (prev.downloadCount || 0) + 1,
          downloads: prev.downloads?.map(d => d.id === item.id ? { ...d, downloadCount: (d.downloadCount || 0) + 1 } : d)
        };
      });
      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="h-8 w-32 bg-zinc-900 rounded mb-8 animate-pulse" />
          <div className="h-64 rounded-2xl bg-zinc-900/50 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-black py-24 text-center px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
          <h2 className="text-xl font-bold text-white mb-2">Application Not Found</h2>
          <p className="text-sm text-zinc-400 mb-6">
            The requested application "{appId}" does not exist or may have been unlisted.
          </p>
          <button
            onClick={() => navigate('/apps')}
            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to App Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] pb-24">
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-zinc-900 bg-zinc-950/60 py-3.5">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 flex items-center justify-between text-xs text-zinc-400">
          <button
            onClick={() => navigate('/apps')}
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to App Library
          </button>
          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
            <span>Marketplace</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-zinc-300">{app.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Header Card */}
      <section className="border-b border-zinc-900 bg-zinc-950/40 py-12">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div className="flex items-start sm:items-center gap-6">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border border-zinc-800 bg-black flex-shrink-0 shadow-2xl">
                <img
                  src={app.iconUrl || '/assets/aistudio/316b0392-3f5b-4a07-a29a-125ff15a90ef_cd7286d7.png'}
                  alt={app.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-800">
                    {app.developer || 'SideEye Studio'}
                  </span>
                  {app.isFeatured && (
                    <span className="rounded bg-amber-950/40 border border-amber-800/80 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                      ★ Featured App
                    </span>
                  )}
                  <span className="text-xs font-mono text-zinc-500">v{app.version}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {app.name}
                </h1>

                <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
                  {app.shortDescription}
                </p>
              </div>
            </div>

            {/* Quick Metadata Column */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-zinc-900 pt-4 sm:pt-0 text-xs text-zinc-400 gap-2">
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 block font-mono">Downloads</span>
                <span className="font-mono font-bold text-white text-base">
                  {(app.downloadCount || 0).toLocaleString()}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 block font-mono">Compatibility</span>
                <span className="font-mono text-zinc-300">{app.platforms?.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Notification Bar if just downloaded */}
      {downloadSuccess && (
        <div className="mx-auto max-w-5xl px-6 pt-6">
          <div className="flex items-center gap-3 rounded-lg border border-emerald-800/80 bg-emerald-950/40 p-4 text-xs text-emerald-200">
            <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-bold">{downloadSuccess}</span>
              <p className="text-emerald-300/80 mt-0.5">Your browser download has started. Verify the SHA-256 integrity signature on installation.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Details & Downloads */}
      <div className="mx-auto max-w-5xl px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left 2 Columns: Description, Screenshots, Notes */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-white border-b border-zinc-900 pb-2">
                About this software
              </h2>
              <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line space-y-3">
                {app.fullDescription}
              </div>
            </section>

            {/* Screenshots Gallery */}
            {app.screenshots && app.screenshots.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <h2 className="text-lg font-bold text-white">Visual Previews & Screenshots</h2>
                  <span className="text-xs font-mono text-zinc-500">{app.screenshots.length} previews</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {app.screenshots.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveScreenshot(imgUrl)}
                      className="group relative cursor-pointer overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 aspect-video"
                    >
                      <img
                        src={imgUrl}
                        alt={`${app.name} preview ${idx + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Platform Specifications */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-white border-b border-zinc-900 pb-2">
                Technical Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
                  <span className="text-zinc-500 block mb-1">Architecture</span>
                  <span className="text-zinc-200">64-bit / ARM64</span>
                </div>
                <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
                  <span className="text-zinc-500 block mb-1">Publisher</span>
                  <span className="text-zinc-200">{app.developer}</span>
                </div>
                <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
                  <span className="text-zinc-500 block mb-1">License</span>
                  <span className="text-zinc-200">Proprietary / Freeware</span>
                </div>
                <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
                  <span className="text-zinc-500 block mb-1">Telemetry</span>
                  <span className="text-emerald-400">0% (None)</span>
                </div>
                <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
                  <span className="text-zinc-500 block mb-1">Release Date</span>
                  <span className="text-zinc-200">{app.releaseDate || '2026'}</span>
                </div>
                <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
                  <span className="text-zinc-500 block mb-1">Last Update</span>
                  <span className="text-zinc-200">{app.updatedAt?.split('T')[0] || 'Recent'}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Downloads Panel */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-6">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-white" />
                  <h3 className="text-base font-bold text-white">Download Packages</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-900/80 px-2 py-0.5 rounded">
                  Official Binaries
                </span>
              </div>

              {/* Downloads list */}
              {app.downloads && app.downloads.length > 0 ? (
                <div className="space-y-4">
                  {app.downloads.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-700"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="text-xs font-bold text-white">{item.name}</div>
                          <div className="text-[11px] font-mono text-zinc-400 break-all">{item.fileName}</div>
                        </div>
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                          {item.platform}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 my-3">
                        <span>v{item.version || app.version}</span>
                        {item.fileSize && <span>{item.fileSize}</span>}
                        {item.downloadCount !== undefined && <span>{item.downloadCount} dl</span>}
                      </div>

                      {item.releaseNotes && (
                        <p className="text-[11px] text-zinc-400 mb-3 bg-zinc-950/80 p-2 rounded border border-zinc-900">
                          {item.releaseNotes}
                        </p>
                      )}

                      {item.platform?.toLowerCase() === 'web' || (item.fileUrl?.startsWith('http') && !item.fileName?.match(/\.(exe|apk|zip|msi|dmg|tar|gz)$/i)) ? (
                        <button
                          onClick={() => handleDownload(item)}
                          disabled={downloadingId === item.id}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-black hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Launch Web Application
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownload(item)}
                          disabled={downloadingId === item.id}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-black hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {downloadingId === item.id ? 'Starting Download...' : `Download ${item.platform} Build`}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-zinc-500">
                  <HardDrive className="mx-auto h-6 w-6 text-zinc-600 mb-2" />
                  No downloadable packages published yet for this application.
                </div>
              )}

              {/* Security signature check */}
              <div className="mt-6 pt-4 border-t border-zinc-900 flex items-start gap-2.5 text-[11px] text-zinc-500">
                <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  All SideEye Studio binaries are cryptographically signed. Zero telemetry, zero bundled third-party installers.
                </span>
              </div>

              {/* Tags */}
              {app.tags && app.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t border-zinc-900">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2">
                    Categorized Under
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {app.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-zinc-900 px-2 py-0.5 text-xs text-zinc-400 border border-zinc-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {activeScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setActiveScreenshot(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setActiveScreenshot(null)}
              className="absolute -top-10 right-0 p-1 text-zinc-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={activeScreenshot}
              alt="Expanded preview"
              className="max-h-[85vh] max-w-full rounded-xl object-contain border border-zinc-800"
            />
          </div>
        </div>
      )}
    </div>
  );
};
