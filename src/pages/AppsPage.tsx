import React, { useState, useMemo } from 'react';
import { useRouter } from '../context/RouterContext';
import { AppModel, TagModel } from '../types';
import { 
  Search, 
  SlidersHorizontal, 
  Download, 
  ArrowRight, 
  Sparkles, 
  Monitor, 
  Smartphone, 
  Globe, 
  Layers,
  ArrowUpDown,
  Tag as TagIcon
} from 'lucide-react';

interface AppsPageProps {
  apps: AppModel[];
  tags: TagModel[];
  loading: boolean;
}

export const AppsPage: React.FC<AppsPageProps> = ({ apps, tags, loading }) => {
  const { navigate } = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'updated' | 'downloads' | 'name' | 'newest'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Extract platforms from tags or unique app platforms
  const platformList = useMemo(() => {
    const list = new Set<string>();
    tags.filter(t => t.type === 'platform').forEach(t => list.add(t.name));
    apps.forEach(a => a.platforms?.forEach(p => list.add(p)));
    return ['All', ...Array.from(list)];
  }, [tags, apps]);

  // Extract category/custom tags
  const categoryTags = useMemo(() => {
    const list = new Set<string>();
    tags.filter(t => t.type !== 'platform').forEach(t => list.add(t.name));
    apps.forEach(a => a.tags?.forEach(t => list.add(t)));
    return ['All', ...Array.from(list)];
  }, [tags, apps]);

  // Filter and sort apps
  const filteredApps = useMemo(() => {
    return apps
      .filter((app) => {
        // Only show published apps
        if (app.status !== 'published') return false;

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = app.name.toLowerCase().includes(q);
          const matchDesc = app.shortDescription?.toLowerCase().includes(q) || app.fullDescription?.toLowerCase().includes(q);
          const matchTag = app.tags?.some(t => t.toLowerCase().includes(q));
          const matchPlatform = app.platforms?.some(p => p.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchTag && !matchPlatform) {
            return false;
          }
        }

        // Platform filter
        if (selectedPlatform !== 'All') {
          if (!app.platforms?.some(p => p.toLowerCase() === selectedPlatform.toLowerCase())) {
            return false;
          }
        }

        // Tag filter
        if (selectedTag !== 'All') {
          if (!app.tags?.some(t => t.toLowerCase() === selectedTag.toLowerCase())) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'downloads') {
          return (b.downloadCount || 0) - (a.downloadCount || 0);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'newest') {
          return (b.releaseDate || '').localeCompare(a.releaseDate || '');
        }
        // Default: updated
        return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      });
  }, [apps, searchQuery, selectedPlatform, selectedTag, sortBy]);

  // Spotlight featured app
  const spotlightApp = useMemo(() => {
    return apps.find(a => a.status === 'published' && a.isFeatured) || apps[0];
  }, [apps]);

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7]">
      {/* Header Banner */}
      <section className="border-b border-zinc-900 bg-zinc-950/70 pt-16 pb-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 uppercase tracking-widest mb-2">
                <Layers className="h-3.5 w-3.5" />
                Software Marketplace
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Application Library
              </h1>
              <p className="mt-3 text-base text-zinc-400 max-w-xl leading-relaxed">
                Explore official software, developer utilities, and games crafted by SideEye Studio. All binaries are signed, telemetry-free, and directly downloadable.
              </p>
            </div>

            {/* Quick stats counter */}
            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-zinc-900 pt-4 md:pt-0 md:pl-8 text-xs font-mono">
              <div>
                <span className="block text-xl font-bold text-white">{apps.filter(a => a.status === 'published').length}</span>
                <span className="text-zinc-500">Available Apps</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-white">
                  {apps.reduce((sum, a) => sum + (a.downloadCount || 0), 0).toLocaleString()}
                </span>
                <span className="text-zinc-500">Total Downloads</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spotlight Hero App (App Store style) */}
      {spotlightApp && !searchQuery && selectedPlatform === 'All' && selectedTag === 'All' && (
        <section className="border-b border-zinc-900 bg-black py-10">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              Featured Release
            </div>
            <div
              onClick={() => navigate(`/apps/${spotlightApp.slug || spotlightApp.id}`)}
              className="cursor-pointer group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-8 transition-all hover:border-zinc-600 hover:bg-zinc-900/60"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-start sm:items-center gap-6">
                  <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border border-zinc-800 bg-black flex-shrink-0 shadow-lg">
                    <img
                      src={spotlightApp.iconUrl || '/assets/aistudio/316b0392-3f5b-4a07-a29a-125ff15a90ef_cd7286d7.png'}
                      alt={spotlightApp.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider">
                        Editor's Choice
                      </span>
                      {spotlightApp.platforms?.map((p) => (
                        <span key={p} className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-800">
                          {p}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-zinc-100 transition-colors">
                      {spotlightApp.name}
                    </h2>
                    <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
                      {spotlightApp.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 flex-shrink-0">
                  <div className="text-left lg:text-right text-xs text-zinc-400">
                    <span className="block font-mono font-semibold text-white">v{spotlightApp.version}</span>
                    <span className="text-zinc-500">{spotlightApp.downloads?.length || 1} available formats</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/apps/${spotlightApp.slug || spotlightApp.id}`);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs font-bold text-black hover:bg-zinc-200 transition-all shadow-md active:scale-95"
                  >
                    View Package & Downloads
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Marketplace Content: Search, Filters, App Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {/* Controls Bar: Search & Sort */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by application name, category, or platform..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sorting & View Toggle */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500" />
                <span className="hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="downloads">Most Downloaded</option>
                  <option value="newest">Release Date</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>

              {/* View layout switch */}
              <div className="hidden sm:flex items-center rounded-md border border-zinc-800 bg-zinc-950 p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2 py-1 text-xs rounded ${viewMode === 'grid' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2 py-1 text-xs rounded ${viewMode === 'list' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Platform & Category Filter Pills */}
          <div className="py-6 space-y-4">
            {/* Platforms */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-zinc-500 mr-2 flex items-center gap-1">
                <Monitor className="h-3 w-3" /> Platform:
              </span>
              {platformList.map((p) => {
                const isSelected = selectedPlatform === p;
                return (
                  <button
                    key={p}
                    onClick={() => setSelectedPlatform(p)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'border border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Category / Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-zinc-500 mr-2 flex items-center gap-1">
                <TagIcon className="h-3 w-3" /> Tag:
              </span>
              {categoryTags.map((t) => {
                const isSelected = selectedTag === t;
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedTag(t)}
                    className={`rounded-md px-2.5 py-0.5 text-xs transition-all ${
                      isSelected
                        ? 'bg-zinc-200 text-black font-semibold'
                        : 'border border-zinc-900 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
              {(selectedPlatform !== 'All' || selectedTag !== 'All' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedPlatform('All');
                    setSelectedTag('All');
                    setSearchQuery('');
                  }}
                  className="text-xs text-zinc-500 hover:text-white underline underline-offset-4 ml-2"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Results count banner */}
          <div className="pb-4 text-xs font-mono text-zinc-500 flex items-center justify-between">
            <span>Showing {filteredApps.length} {filteredApps.length === 1 ? 'application' : 'applications'}</span>
          </div>

          {/* Application Listings Grid / List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-xl border border-zinc-800 bg-zinc-950/40 animate-pulse" />
              ))}
            </div>
          ) : filteredApps.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => navigate(`/apps/${app.slug || app.id}`)}
                    className="group cursor-pointer flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-950 p-6 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-900/40"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="h-16 w-16 overflow-hidden rounded-xl border border-zinc-800 bg-black flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                          <img
                            src={app.iconUrl || '/assets/aistudio/316b0392-3f5b-4a07-a29a-125ff15a90ef_cd7286d7.png'}
                            alt={app.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          {app.isFeatured && (
                            <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[9px] font-mono text-amber-300 font-semibold uppercase">
                              ★ Featured
                            </span>
                          )}
                          <div className="flex flex-wrap justify-end gap-1">
                            {app.platforms?.map((p) => (
                              <span
                                key={p}
                                className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-800"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-zinc-100 transition-colors">
                          {app.name}
                        </h3>
                        <span className="text-xs font-mono text-zinc-500">v{app.version}</span>
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                        {app.shortDescription}
                      </p>

                      {/* Tag badges */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {app.tags?.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] text-zinc-500 bg-zinc-900/80 px-2 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-zinc-900 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-mono text-[11px]">
                        {app.downloadCount ? `${app.downloadCount.toLocaleString()} downloads` : 'Direct download'}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-white group-hover:translate-x-1 transition-transform">
                        Explore
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-3">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => navigate(`/apps/${app.slug || app.id}`)}
                    className="group cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-zinc-800/80 bg-zinc-950 p-4 transition-all hover:border-zinc-600 hover:bg-zinc-900/40"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl overflow-hidden border border-zinc-800 bg-black flex-shrink-0">
                        <img
                          src={app.iconUrl || '/assets/aistudio/316b0392-3f5b-4a07-a29a-125ff15a90ef_cd7286d7.png'}
                          alt={app.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white group-hover:text-zinc-200">
                            {app.name}
                          </h3>
                          <span className="text-xs font-mono text-zinc-500">v{app.version}</span>
                          {app.isFeatured && (
                            <span className="text-[9px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/60 px-1.5 py-0.2 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                          {app.shortDescription}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-500 font-mono">
                          <span>{app.platforms?.join(' · ')}</span>
                          <span>•</span>
                          <span>{app.downloads?.length || 0} packages</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right text-xs font-mono text-zinc-500 hidden md:block">
                        {app.downloadCount ? `${app.downloadCount.toLocaleString()} dl` : ''}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/apps/${app.slug || app.id}`);
                        }}
                        className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Clean empty state
            <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
              <Search className="mx-auto h-8 w-8 text-zinc-600 mb-3" />
              <h3 className="text-sm font-semibold text-white">No applications match your query</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Try adjusting your search keywords, clearing platform filters, or selecting a different tag.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPlatform('All');
                  setSelectedTag('All');
                }}
                className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
