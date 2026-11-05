import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType>({
  path: '/',
  navigate: () => {},
  params: {},
});

export const useRouter = () => useContext(RouterContext);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (window.location.pathname !== to) {
      window.history.pushState({}, '', to);
      setCurrentPath(to);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Helper to extract params like /apps/:appId
  const params: Record<string, string> = {};
  if (currentPath.startsWith('/apps/')) {
    const parts = currentPath.split('/');
    if (parts[2]) {
      params.appId = decodeURIComponent(parts[2]);
    }
  }

  return (
    <RouterContext.Provider value={{ path: currentPath, navigate, params }}>
      {children}
    </RouterContext.Provider>
  );
};
