import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  announcement?: {
    enabled: boolean;
    text: string;
    linkText?: string;
    linkUrl?: string;
  };
}

export const Navbar: React.FC<NavbarProps> = ({ announcement }) => {
  const { path, navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Apps', href: '/apps' },
    { label: 'About', href: '/about' },
  ];

  const handleNav = (href: string) => {
    navigate(href);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-black/90 backdrop-blur-md">
      {/* Announcement Bar if active */}
      {announcement?.enabled && announcement.text && (
        <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-2 text-center text-xs font-medium text-zinc-300">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
            <span>{announcement.text}</span>
            {announcement.linkUrl && announcement.linkText && (
              <button
                onClick={() => handleNav(announcement.linkUrl!)}
                className="inline-flex items-center gap-0.5 text-white underline decoration-zinc-500 underline-offset-4 hover:decoration-white transition-colors"
              >
                {announcement.linkText}
                <ArrowUpRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <button
          onClick={() => handleNav('/')}
          className="group flex items-center gap-3 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 rounded-sm"
        >
          <div className="relative h-8 w-8 overflow-hidden rounded bg-black border border-zinc-800 transition-transform duration-200 group-hover:scale-105">
            <img
              src="/assets/aistudio/Stealthy_Eye_Emblem_40da80da.png"
              alt="SideEye Studio Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-white group-hover:text-zinc-200 transition-colors">
              SideEye Studio
            </span>
            <span className="text-[10px] tracking-wider uppercase text-zinc-500 font-mono">
              Software & Games
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = path === link.href || (link.href !== '/' && path.startsWith(link.href));
            return (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-150 rounded-md ${
                  isActive
                    ? 'text-white bg-zinc-900/80 font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                {link.label}
              </button>
            );
          })}
          <button
            onClick={() => handleNav('/apps')}
            className="ml-3 inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800 hover:text-white hover:border-zinc-500 transition-all active:scale-[0.98]"
          >
            App Store
          </button>
        </nav>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="border-b border-zinc-900 bg-zinc-950 px-6 py-4 md:hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = path === link.href || (link.href !== '/' && path.startsWith(link.href));
              return (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className={`block w-full text-left rounded-md px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            <div className="pt-2">
              <button
                onClick={() => handleNav('/apps')}
                className="w-full text-center rounded-md bg-white px-3 py-2 text-sm font-medium text-black hover:bg-zinc-200 transition-colors"
              >
                Explore All Software
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
