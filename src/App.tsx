import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AppsPage } from './pages/AppsPage';
import { AppDetailPage } from './pages/AppDetailPage';
import { AboutPage } from './pages/AboutPage';
import { StaffPortalPage } from './pages/StaffPortalPage';
import { fetchPublishedApps, fetchAllTags, fetchSiteConfig } from './lib/db';
import { AppModel, TagModel, SiteConfigModel } from './types';

function AppContent() {
  const { path, params } = useRouter();
  const [apps, setApps] = useState<AppModel[]>([]);
  const [tags, setTags] = useState<TagModel[]>([]);
  const [config, setConfig] = useState<SiteConfigModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadPublicData() {
      try {
        const [appsData, tagsData, configData] = await Promise.all([
          fetchPublishedApps(),
          fetchAllTags(),
          fetchSiteConfig()
        ]);
        if (isMounted) {
          setApps(appsData);
          setTags(tagsData);
          setConfig(configData);
        }
      } catch (err) {
        console.error('Error fetching public site data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPublicData();
    return () => { isMounted = false; };
  }, [path]);

  // Handle Private Staff Portal Route (Strictly Private - No public nav/footer)
  if (path === '/st4ff0nly3' || path.startsWith('/st4ff0nly3/')) {
    return <StaffPortalPage />;
  }

  // Filter featured apps for homepage
  const featuredApps = apps.filter(a => a.isFeatured && a.status === 'published');

  return (
    <div className="flex flex-col min-h-screen bg-black text-[#f5f5f7]">
      <Navbar announcement={config?.announcement} />

      <main className="flex-1">
        {path === '/' && (
          <HomePage featuredApps={featuredApps} config={config} loading={loading} />
        )}

        {path === '/apps' && (
          <AppsPage apps={apps} tags={tags} loading={loading} />
        )}

        {path.startsWith('/apps/') && params.appId && (
          <AppDetailPage appId={params.appId} />
        )}

        {path === '/about' && (
          <AboutPage config={config} />
        )}

        {/* Fallback for unknown subroutes: default to homepage */}
        {path !== '/' && path !== '/apps' && !path.startsWith('/apps/') && path !== '/about' && (
          <HomePage featuredApps={featuredApps} config={config} loading={loading} />
        )}
      </main>

      <Footer config={config} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </AuthProvider>
  );
}
