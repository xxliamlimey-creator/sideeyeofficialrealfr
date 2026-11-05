import React, { useState, useEffect } from 'react';
import { useAuth, SUPER_ADMIN_EMAIL } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { AppModel, TagModel, StaffModel, SiteConfigModel, DownloadItem, StaffRole } from '../types';
import {
  fetchAllAppsForStaff,
  saveApp,
  deleteAppById,
  fetchAllTags,
  saveTag,
  deleteTagById,
  fetchAllStaff,
  saveStaffMember,
  deleteStaffMember,
  fetchSiteConfig,
  saveSiteConfig
} from '../lib/db';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  Tag as TagIcon,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Check,
  X,
  Upload,
  Trash2,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Download,
  FileCode,
  HardDrive,
  RefreshCw,
  Search,
  ChevronRight,
  FolderPlus
} from 'lucide-react';

export const StaffPortalPage: React.FC = () => {
  const { 
    currentUser, 
    loading: authLoading, 
    isAuthorizedStaff, 
    isSuperAdmin, 
    staffRole, 
    signInWithGoogle, 
    signOut 
  } = useAuth();
  const { navigate } = useRouter();

  // Navigation tab in staff dashboard
  const [activeTab, setActiveTab] = useState<
    'overview' | 'apps' | 'add-app' | 'tags' | 'staff' | 'settings'
  >('overview');

  // Data states
  const [apps, setApps] = useState<AppModel[]>([]);
  const [tags, setTags] = useState<TagModel[]>([]);
  const [staffList, setStaffList] = useState<StaffModel[]>([]);
  const [config, setConfig] = useState<SiteConfigModel | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // App Editor state
  const [editingApp, setEditingApp] = useState<AppModel | null>(null);
  const [appFormTab, setAppFormTab] = useState<'basic' | 'media' | 'platforms' | 'downloads' | 'publish'>('basic');
  const [deleteConfirmAppId, setDeleteConfirmAppId] = useState<string | null>(null);

  // Tag Form state
  const [newTag, setNewTag] = useState({ name: '', description: '', type: 'category' as 'platform' | 'category' | 'custom', color: '#71717a' });

  // Staff Form state (Owner only)
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<StaffRole>('developer');

  // Load all staff portal data
  const loadPortalData = async () => {
    if (!isAuthorizedStaff) return;
    setLoadingData(true);
    try {
      const [appsData, tagsData, configData] = await Promise.all([
        fetchAllAppsForStaff(),
        fetchAllTags(),
        fetchSiteConfig()
      ]);
      setApps(appsData);
      setTags(tagsData);
      setConfig(configData);

      // Only super admin owner fetches staff list
      if (isSuperAdmin) {
        const staffData = await fetchAllStaff();
        setStaffList(staffData);
      }
    } catch (err) {
      console.error('Error loading portal data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthorizedStaff) {
      loadPortalData();
    }
  }, [isAuthorizedStaff, isSuperAdmin]);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // ----------------- APP MANAGEMENT HANDLERS -----------------

  const initNewApp = () => {
    const fresh: AppModel = {
      id: '',
      name: '',
      slug: '',
      shortDescription: '',
      fullDescription: '',
      iconUrl: '/assets/aistudio/Stealthy_Eye_Emblem_40da80da.png',
      developer: 'SideEye Studio',
      version: '1.0.0',
      releaseDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      platforms: ['Windows'],
      tags: ['Utilities'],
      status: 'draft',
      isFeatured: false,
      screenshots: [],
      downloads: [],
      viewCount: 0,
      downloadCount: 0,
    };
    setEditingApp(fresh);
    setAppFormTab('basic');
    setActiveTab('add-app');
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    if (!editingApp.name.trim()) {
      showNotification('Application name is required.', 'error');
      return;
    }

    const slug = editingApp.slug.trim() || editingApp.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const finalApp: AppModel = {
      ...editingApp,
      id: editingApp.id || slug,
      slug: slug,
      updatedAt: new Date().toISOString()
    };

    try {
      await saveApp(finalApp);
      showNotification(`Application "${finalApp.name}" saved successfully.`);
      setEditingApp(null);
      setActiveTab('apps');
      await loadPortalData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save application';
      showNotification(msg, 'error');
    }
  };

  const handleDeleteApp = async (appId: string) => {
    try {
      await deleteAppById(appId);
      showNotification('Application deleted successfully.');
      setDeleteConfirmAppId(null);
      await loadPortalData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete application';
      showNotification(msg, 'error');
    }
  };

  const togglePublishStatus = async (app: AppModel) => {
    const updated: AppModel = {
      ...app,
      status: app.status === 'published' ? 'draft' : 'published',
      updatedAt: new Date().toISOString()
    };
    try {
      await saveApp(updated);
      showNotification(`${app.name} is now ${updated.status}.`);
      await loadPortalData();
    } catch (err) {
      showNotification('Failed to update status', 'error');
    }
  };

  const toggleFeaturedStatus = async (app: AppModel) => {
    const updated: AppModel = {
      ...app,
      isFeatured: !app.isFeatured,
      updatedAt: new Date().toISOString()
    };
    try {
      await saveApp(updated);
      showNotification(`${app.name} featured state updated.`);
      await loadPortalData();
    } catch (err) {
      showNotification('Failed to update featured flag', 'error');
    }
  };

  // Add a new download target inside editing app
  const addDownloadTarget = () => {
    if (!editingApp) return;
    const newDownload: DownloadItem = {
      id: `dl-${Date.now()}`,
      platform: editingApp.platforms[0] || 'Windows',
      name: `${editingApp.platforms[0] || 'Windows'} Package`,
      fileName: `${editingApp.name.replace(/\s+/g, '_')}_Setup.exe`,
      version: editingApp.version || '1.0.0',
      fileSize: '24.5 MB',
      fileUrl: '#download-release',
      releaseNotes: 'Initial production build.',
      downloadCount: 0,
      uploadedAt: new Date().toISOString()
    };
    setEditingApp({
      ...editingApp,
      downloads: [...(editingApp.downloads || []), newDownload]
    });
  };

  // Handle local file upload for downloadable binary or icon
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'icon' | 'screenshot' | number) => {
    const file = e.target.files?.[0];
    if (!file || !editingApp) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === 'icon') {
        setEditingApp({ ...editingApp, iconUrl: dataUrl });
        showNotification('App icon updated from local file.');
      } else if (target === 'screenshot') {
        setEditingApp({
          ...editingApp,
          screenshots: [...(editingApp.screenshots || []), dataUrl]
        });
        showNotification('Screenshot added.');
      } else if (typeof target === 'number') {
        // Target is index of download item
        const updatedDls = [...(editingApp.downloads || [])];
        if (updatedDls[target]) {
          const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
          updatedDls[target] = {
            ...updatedDls[target],
            fileName: file.name,
            fileSize: `${sizeMb} MB`,
            fileUrl: dataUrl,
            uploadedAt: new Date().toISOString()
          };
          setEditingApp({ ...editingApp, downloads: updatedDls });
          showNotification(`Attached package file: ${file.name}`);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // ----------------- TAG HANDLERS -----------------

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.name.trim()) return;
    const id = newTag.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const tagObj: TagModel = {
      id,
      name: newTag.name.trim(),
      description: newTag.description.trim() || `${newTag.name} tag`,
      type: newTag.type,
      color: newTag.color,
      createdAt: new Date().toISOString()
    };
    try {
      await saveTag(tagObj);
      showNotification(`Created tag "${tagObj.name}".`);
      setNewTag({ name: '', description: '', type: 'category', color: '#71717a' });
      await loadPortalData();
    } catch (err: unknown) {
      showNotification('Failed to create tag', 'error');
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await deleteTagById(tagId);
      showNotification('Tag removed.');
      await loadPortalData();
    } catch (err) {
      showNotification('Failed to delete tag', 'error');
    }
  };

  // ----------------- STAFF HANDLERS (OWNER ONLY) -----------------

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail.trim() || !newStaffEmail.includes('@')) {
      showNotification('Please enter a valid Google email address.', 'error');
      return;
    }
    const email = newStaffEmail.trim().toLowerCase();
    const docId = email.replace(/[@.]/g, '_');
    const staffObj: StaffModel = {
      id: docId,
      email: email,
      role: newStaffRole,
      displayName: email.split('@')[0],
      addedAt: new Date().toISOString(),
      addedBy: currentUser?.email || 'Owner',
      isSuperAdmin: email === SUPER_ADMIN_EMAIL.toLowerCase()
    };

    try {
      await saveStaffMember(staffObj);
      showNotification(`Authorized ${email} as ${newStaffRole}.`);
      setNewStaffEmail('');
      await loadPortalData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to authorize staff';
      showNotification(msg, 'error');
    }
  };

  const handleRemoveStaff = async (staff: StaffModel) => {
    if (staff.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      showNotification('The owner account cannot be removed.', 'error');
      return;
    }
    try {
      await deleteStaffMember(staff.id, staff.email);
      showNotification(`Removed staff access for ${staff.email}.`);
      await loadPortalData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove staff';
      showNotification(msg, 'error');
    }
  };

  // ----------------- SETTINGS HANDLERS -----------------

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    try {
      await saveSiteConfig(config);
      showNotification('Website settings updated and live.');
    } catch (err: unknown) {
      showNotification('Failed to save settings', 'error');
    }
  };

  // ----------------- AUTH CHECK / LOGIN VIEW -----------------

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="h-10 w-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-zinc-500">Verifying authorized staff credentials...</p>
        </div>
      </div>
    );
  }

  // Not signed in: Show confidential staff login gate
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl text-center">
          <div className="mx-auto mb-6 h-20 w-20 overflow-hidden rounded-2xl border border-zinc-800 bg-black p-1 shadow-md">
            <img
              src="/assets/aistudio/Stealthy_Eye_Emblem_40da80da.png"
              alt="SideEye Studio Staff"
              className="h-full w-full object-cover rounded-xl"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-[11px] font-mono text-zinc-400 mb-4">
            <ShieldCheck className="h-3.5 w-3.5 text-zinc-300" />
            SECURE PORTAL
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Staff Portal
          </h1>
          <p className="text-xs text-zinc-400 mb-8 leading-relaxed">
            Restricted administrative gateway for SideEye Studio developers and management. Authorized Google authentication is required to access system controls.
          </p>

          <button
            onClick={() => signInWithGoogle()}
            className="w-full inline-flex items-center justify-center gap-3 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200 transition-all shadow-md active:scale-[0.98]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="mt-8 pt-6 border-t border-zinc-900 text-[11px] text-zinc-600 font-mono">
            Initial Super Administrator: {SUPER_ADMIN_EMAIL}
          </div>
        </div>
      </div>
    );
  }

  // Signed in but NOT authorized as staff
  if (!isAuthorizedStaff) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-900/50 bg-zinc-950 p-8 shadow-2xl text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            Your account <span className="font-mono text-white">{currentUser.email}</span> is authenticated, but is not on the authorized staff roster for SideEye Studio.
          </p>

          <div className="rounded-lg border border-zinc-900 bg-zinc-900/50 p-3 mb-6 text-[11px] text-zinc-500 text-left space-y-1">
            <p>• Only authorized developers and administrators may access this portal.</p>
            <p>• Contact the owner ({SUPER_ADMIN_EMAIL}) if you require an invitation.</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => signOut()}
              className="w-full rounded-md bg-white px-4 py-2.5 text-xs font-bold text-black hover:bg-zinc-200 transition-colors"
            >
              Sign Out / Switch Google Account
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white"
            >
              Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------- AUTHORIZED STAFF DASHBOARD -----------------

  const stats = {
    totalApps: apps.length,
    published: apps.filter(a => a.status === 'published').length,
    drafts: apps.filter(a => a.status === 'draft').length,
    totalDownloads: apps.reduce((acc, a) => acc + (a.downloadCount || 0), 0),
    totalStaff: isSuperAdmin ? staffList.length + 1 : 1
  };

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] flex flex-col md:flex-row">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border p-4 text-xs shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 ${
            statusMessage.type === 'success'
              ? 'border-emerald-800 bg-emerald-950/90 text-emerald-200'
              : 'border-red-800 bg-red-950/90 text-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? <Check className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-red-400" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-900 bg-zinc-950/90 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg overflow-hidden border border-zinc-800 bg-black">
                <img
                  src="/assets/aistudio/Stealthy_Eye_Emblem_40da80da.png"
                  alt="SideEye Emblem"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">SideEye Studio</span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Staff Portal</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              title="View Public Site"
              className="text-zinc-500 hover:text-white p-1"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </button>

            <button
              onClick={() => setActiveTab('apps')}
              className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'apps'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4" />
                Applications
              </div>
              <span className="font-mono text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
                {apps.length}
              </span>
            </button>

            <button
              onClick={() => initNewApp()}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'add-app'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              Add Application
            </button>

            <button
              onClick={() => setActiveTab('tags')}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'tags'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <TagIcon className="h-4 w-4" />
              Categories & Tags
            </button>

            {/* Staff Management - Owner only */}
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('staff')}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === 'staff'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-amber-400" />
                  Staff Roster
                </div>
                <span className="text-[9px] font-mono text-amber-300 bg-amber-950/60 border border-amber-900/60 px-1 py-0.2 rounded">
                  Owner
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <Settings className="h-4 w-4" />
              Website Settings
            </button>
          </nav>
        </div>

        {/* User Account Signout Footer */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950">
          <div className="flex items-center justify-between mb-3">
            <div className="truncate pr-2">
              <span className="text-xs font-semibold text-white block truncate">
                {currentUser.displayName || currentUser.email}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">
                {staffRole || 'Authorized'} {isSuperAdmin ? '(Super Admin)' : ''}
              </span>
            </div>
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="text-zinc-400 hover:text-red-400 p-1.5 rounded hover:bg-zinc-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => loadPortalData()}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 py-1"
          >
            <RefreshCw className="h-3 w-3" />
            Sync Database
          </button>
        </div>
      </aside>

      {/* Main Administrative Content Area */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Studio Overview</h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Active deployment telemetry, published catalog, and staff metrics.
                </p>
              </div>
              <button
                onClick={() => initNewApp()}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Publish New App
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-5">
                <span className="text-xs font-mono text-zinc-500 block mb-1">Total Applications</span>
                <span className="text-3xl font-extrabold text-white font-mono">{stats.totalApps}</span>
                <div className="text-[11px] text-zinc-500 mt-2">{stats.published} published · {stats.drafts} drafts</div>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-5">
                <span className="text-xs font-mono text-zinc-500 block mb-1">Total Downloads</span>
                <span className="text-3xl font-extrabold text-white font-mono">{stats.totalDownloads.toLocaleString()}</span>
                <div className="text-[11px] text-emerald-400 mt-2">Active telemetry recorded</div>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-5">
                <span className="text-xs font-mono text-zinc-500 block mb-1">Published Software</span>
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">{stats.published}</span>
                <div className="text-[11px] text-zinc-500 mt-2">Live on marketplace</div>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-5">
                <span className="text-xs font-mono text-zinc-500 block mb-1">Staff Access</span>
                <span className="text-3xl font-extrabold text-white font-mono">{stats.totalStaff}</span>
                <div className="text-[11px] text-zinc-500 mt-2">RBAC enforced</div>
              </div>
            </div>

            {/* Recently Updated Applications */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-4">
                <h3 className="text-sm font-bold text-white">Application Catalog Status</h3>
                <button
                  onClick={() => setActiveTab('apps')}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Manage all
                </button>
              </div>

              <div className="space-y-3">
                {apps.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-zinc-800 bg-black flex-shrink-0">
                        <img src={app.iconUrl} alt={app.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{app.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500">v{app.version}</span>
                        </div>
                        <span className="text-[11px] text-zinc-400">{app.platforms?.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          app.status === 'published'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {app.status}
                      </span>
                      <button
                        onClick={() => {
                          setEditingApp(app);
                          setActiveTab('add-app');
                        }}
                        className="text-zinc-400 hover:text-white p-1"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPLICATIONS LIST */}
        {activeTab === 'apps' && (
          <div className="space-y-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Applications Management</h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Publish, configure, reorder packages, and feature applications on the public marketplace.
                </p>
              </div>
              <button
                onClick={() => initNewApp()}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Application
              </button>
            </div>

            {/* Apps table / cards */}
            <div className="space-y-3">
              {apps.map((app) => (
                <div
                  key={app.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl overflow-hidden border border-zinc-800 bg-black flex-shrink-0">
                      <img src={app.iconUrl} alt={app.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{app.name}</span>
                        <span className="text-xs font-mono text-zinc-500">v{app.version}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            app.status === 'published'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900'
                              : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                          }`}
                        >
                          {app.status}
                        </span>
                        {app.isFeatured && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-900">
                            ★ Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{app.shortDescription}</p>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 mt-1.5">
                        <span>Platforms: {app.platforms?.join(', ')}</span>
                        <span>•</span>
                        <span>Downloads: {(app.downloadCount || 0).toLocaleString()}</span>
                        <span>•</span>
                        <span>Files: {app.downloads?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                    <button
                      onClick={() => togglePublishStatus(app)}
                      title={app.status === 'published' ? 'Unpublish' : 'Publish'}
                      className="rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800"
                    >
                      {app.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>

                    <button
                      onClick={() => toggleFeaturedStatus(app)}
                      title={app.isFeatured ? 'Remove featured' : 'Mark featured'}
                      className={`rounded border px-2.5 py-1.5 text-xs ${
                        app.isFeatured
                          ? 'border-amber-800/80 bg-amber-950/40 text-amber-300'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {app.isFeatured ? 'Featured' : 'Feature'}
                    </button>

                    <button
                      onClick={() => {
                        setEditingApp(app);
                        setActiveTab('add-app');
                      }}
                      className="rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-white hover:bg-zinc-800"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => setDeleteConfirmAppId(app.id)}
                      className="rounded border border-red-950/80 bg-red-950/30 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-900/50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmAppId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
                  <div className="flex items-center gap-3 text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    <h3 className="text-base font-bold text-white">Delete Application?</h3>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    This will permanently remove the application and its associated downloads from the SideEye Studio database.
                  </p>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setDeleteConfirmAppId(null)}
                      className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteApp(deleteConfirmAppId)}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500"
                    >
                      Confirm Deletion
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADD / EDIT APPLICATION (Polished Tabbed Form) */}
        {activeTab === 'add-app' && editingApp && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div>
                <h1 className="text-xl font-bold text-white">
                  {editingApp.id ? `Edit: ${editingApp.name}` : 'Create New Application'}
                </h1>
                <p className="text-xs text-zinc-400">
                  Configure release metadata, platform support, assets, and downloadable binaries.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingApp(null);
                  setActiveTab('apps');
                }}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            {/* Form Section Navigation */}
            <div className="flex border-b border-zinc-900 gap-1 text-xs">
              {[
                { id: 'basic', label: '1. Basic Information' },
                { id: 'media', label: '2. Media & Previews' },
                { id: 'platforms', label: '3. Platforms & Tags' },
                { id: 'downloads', label: '4. Download Packages' },
                { id: 'publish', label: '5. Publishing' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAppFormTab(tab.id as any)}
                  className={`px-4 py-2.5 font-medium border-b-2 transition-colors ${
                    appFormTab === tab.id
                      ? 'border-white text-white font-bold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveApp} className="space-y-6">
              {/* SUBSECTION 1: BASIC INFO */}
              {appFormTab === 'basic' && (
                <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-zinc-400 block mb-1">Application Name *</label>
                      <input
                        type="text"
                        value={editingApp.name}
                        onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })}
                        placeholder="e.g. Mystery Dice"
                        required
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-zinc-400 block mb-1">URL Slug / ID</label>
                      <input
                        type="text"
                        value={editingApp.slug}
                        onChange={(e) => setEditingApp({ ...editingApp, slug: e.target.value })}
                        placeholder="e.g. mystery-dice"
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-mono text-zinc-400 block mb-1">Version</label>
                      <input
                        type="text"
                        value={editingApp.version}
                        onChange={(e) => setEditingApp({ ...editingApp, version: e.target.value })}
                        placeholder="1.0.0"
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-zinc-400 block mb-1">Developer / Publisher</label>
                      <input
                        type="text"
                        value={editingApp.developer}
                        onChange={(e) => setEditingApp({ ...editingApp, developer: e.target.value })}
                        placeholder="SideEye Studio"
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-zinc-400 block mb-1">Release Date</label>
                      <input
                        type="date"
                        value={editingApp.releaseDate}
                        onChange={(e) => setEditingApp({ ...editingApp, releaseDate: e.target.value })}
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">Short Description *</label>
                    <textarea
                      rows={2}
                      value={editingApp.shortDescription}
                      onChange={(e) => setEditingApp({ ...editingApp, shortDescription: e.target.value })}
                      placeholder="Brief overview shown on marketplace cards (1-2 sentences)"
                      required
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">Full Description</label>
                    <textarea
                      rows={6}
                      value={editingApp.fullDescription}
                      onChange={(e) => setEditingApp({ ...editingApp, fullDescription: e.target.value })}
                      placeholder="Comprehensive product details, game mechanics, system requirements, changelog..."
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* SUBSECTION 2: MEDIA & PREVIEWS */}
              {appFormTab === 'media' && (
                <div className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
                  {/* App Icon */}
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-2">Application Icon</label>
                    <div className="flex items-center gap-5">
                      <div className="h-16 w-16 rounded-xl overflow-hidden border border-zinc-800 bg-black flex-shrink-0">
                        <img src={editingApp.iconUrl} alt="App Icon" className="h-full w-full object-cover" />
                      </div>
                      <div className="space-y-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white hover:bg-zinc-800">
                          <Upload className="h-3.5 w-3.5" />
                          Upload Custom Icon
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'icon')}
                          />
                        </label>
                        <p className="text-[11px] text-zinc-500">Supports PNG, JPG, WebP. Default is the official SideEye emblem.</p>
                      </div>
                    </div>
                  </div>

                  {/* Screenshots */}
                  <div className="pt-6 border-t border-zinc-900">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-mono text-zinc-400">Screenshots & Media Gallery</label>
                      <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-white bg-zinc-900 px-3 py-1 rounded border border-zinc-800 hover:bg-zinc-800">
                        <Upload className="h-3 w-3" />
                        Add Screenshot File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'screenshot')}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {editingApp.screenshots?.map((url, i) => (
                        <div key={i} className="relative rounded-lg overflow-hidden border border-zinc-800 aspect-video group">
                          <img src={url} alt={`Screenshot ${i}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editingApp.screenshots.filter((_, idx) => idx !== i);
                              setEditingApp({ ...editingApp, screenshots: updated });
                            }}
                            className="absolute top-1 right-1 bg-red-950/80 text-red-300 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {(!editingApp.screenshots || editingApp.screenshots.length === 0) && (
                        <div className="col-span-full border border-dashed border-zinc-800 rounded-lg p-6 text-center text-xs text-zinc-500">
                          No screenshots uploaded yet. Click "Add Screenshot File" to attach product views.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBSECTION 3: PLATFORMS & TAGS */}
              {appFormTab === 'platforms' && (
                <div className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
                  {/* Platforms */}
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-2">Supported Platforms</label>
                    <div className="flex flex-wrap gap-2">
                      {['Windows', 'Android', 'Web', 'Linux', 'macOS'].map((p) => {
                        const isChecked = editingApp.platforms?.includes(p);
                        return (
                          <button
                            type="button"
                            key={p}
                            onClick={() => {
                              const curr = editingApp.platforms || [];
                              const updated = isChecked ? curr.filter(x => x !== p) : [...curr, p];
                              setEditingApp({ ...editingApp, platforms: updated });
                            }}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium border transition-colors ${
                              isChecked
                                ? 'bg-white text-black font-bold border-white'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            {isChecked ? '✓ ' : ''}{p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="pt-6 border-t border-zinc-900">
                    <label className="text-xs font-mono text-zinc-400 block mb-2">Marketplace Categories & Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((t) => {
                        const isChecked = editingApp.tags?.includes(t.name);
                        return (
                          <button
                            type="button"
                            key={t.id}
                            onClick={() => {
                              const curr = editingApp.tags || [];
                              const updated = isChecked ? curr.filter(x => x !== t.name) : [...curr, t.name];
                              setEditingApp({ ...editingApp, tags: updated });
                            }}
                            className={`rounded-md px-2.5 py-1 text-xs border transition-colors ${
                              isChecked
                                ? 'bg-zinc-200 text-black font-semibold border-zinc-200'
                                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            {isChecked ? '✓ ' : ''}{t.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBSECTION 4: DOWNLOAD PACKAGES (Real Downloadable Binaries) */}
              {appFormTab === 'downloads' && (
                <div className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                    <div>
                      <h3 className="text-sm font-bold text-white">Application Download Packages</h3>
                      <p className="text-xs text-zinc-400">
                        Upload or specify native installers (.exe, .msi, .apk, .zip, .tar.gz) for public download.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addDownloadTarget()}
                      className="inline-flex items-center gap-1.5 rounded bg-white px-3 py-1.5 text-xs font-bold text-black hover:bg-zinc-200"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Add Download Target
                    </button>
                  </div>

                  <div className="space-y-4">
                    {editingApp.downloads?.map((dl, index) => (
                      <div key={dl.id} className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">Download Target #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editingApp.downloads.filter((_, idx) => idx !== index);
                              setEditingApp({ ...editingApp, downloads: updated });
                            }}
                            className="text-red-400 hover:text-red-300 text-xs inline-flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" /> Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] font-mono text-zinc-400 block mb-1">Platform</label>
                            <select
                              value={dl.platform}
                              onChange={(e) => {
                                const updated = [...editingApp.downloads];
                                updated[index].platform = e.target.value;
                                setEditingApp({ ...editingApp, downloads: updated });
                              }}
                              className="w-full rounded bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs text-white"
                            >
                              <option value="Windows">Windows</option>
                              <option value="Android">Android</option>
                              <option value="Linux">Linux</option>
                              <option value="macOS">macOS</option>
                              <option value="Web">Web</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] font-mono text-zinc-400 block mb-1">Display Label</label>
                            <input
                              type="text"
                              value={dl.name}
                              onChange={(e) => {
                                const updated = [...editingApp.downloads];
                                updated[index].name = e.target.value;
                                setEditingApp({ ...editingApp, downloads: updated });
                              }}
                              placeholder="Windows 64-bit Installer"
                              className="w-full rounded bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-mono text-zinc-400 block mb-1">File Name</label>
                            <input
                              type="text"
                              value={dl.fileName}
                              onChange={(e) => {
                                const updated = [...editingApp.downloads];
                                updated[index].fileName = e.target.value;
                                setEditingApp({ ...editingApp, downloads: updated });
                              }}
                              placeholder="Setup.exe"
                              className="w-full rounded bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-mono text-zinc-400 block mb-1">File Size</label>
                            <input
                              type="text"
                              value={dl.fileSize}
                              onChange={(e) => {
                                const updated = [...editingApp.downloads];
                                updated[index].fileSize = e.target.value;
                                setEditingApp({ ...editingApp, downloads: updated });
                              }}
                              placeholder="e.g. 48.2 MB"
                              className="w-full rounded bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-mono text-zinc-400 block mb-1">Upload Real Binary / Package</label>
                            <label className="cursor-pointer flex items-center justify-center gap-2 rounded bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700">
                              <Upload className="h-3 w-3" />
                              <span>Select File (.exe, .apk, .zip, etc.)</span>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, index)}
                              />
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-mono text-zinc-400 block mb-1">Release Notes</label>
                          <input
                            type="text"
                            value={dl.releaseNotes || ''}
                            onChange={(e) => {
                              const updated = [...editingApp.downloads];
                              updated[index].releaseNotes = e.target.value;
                              setEditingApp({ ...editingApp, downloads: updated });
                            }}
                            placeholder="Bug fixes, performance improvements..."
                            className="w-full rounded bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    ))}

                    {(!editingApp.downloads || editingApp.downloads.length === 0) && (
                      <div className="border border-dashed border-zinc-800 rounded-lg p-6 text-center text-xs text-zinc-500">
                        No downloadable packages added yet. Click "Add Download Target" to configure files.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUBSECTION 5: PUBLISHING & VISIBILITY */}
              {appFormTab === 'publish' && (
                <div className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/60 border border-zinc-800">
                    <div>
                      <span className="text-sm font-bold text-white block">Publishing Status</span>
                      <span className="text-xs text-zinc-400">
                        {editingApp.status === 'published'
                          ? 'This application is visible on the public website and app store.'
                          : 'This application is currently a private draft (staff only).'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingApp({
                          ...editingApp,
                          status: editingApp.status === 'published' ? 'draft' : 'published'
                        })
                      }
                      className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${
                        editingApp.status === 'published'
                          ? 'bg-emerald-500 text-black'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {editingApp.status === 'published' ? 'Published' : 'Draft'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/60 border border-zinc-800">
                    <div>
                      <span className="text-sm font-bold text-white block">Featured Showcase</span>
                      <span className="text-xs text-zinc-400">
                        Display this application prominently on the homepage and spotlight carousel.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingApp({
                          ...editingApp,
                          isFeatured: !editingApp.isFeatured
                        })
                      }
                      className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${
                        editingApp.isFeatured
                          ? 'bg-amber-400 text-black'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {editingApp.isFeatured ? '★ Featured' : 'Standard'}
                    </button>
                  </div>
                </div>
              )}

              {/* Form Submit Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => {
                    setEditingApp(null);
                    setActiveTab('apps');
                  }}
                  className="rounded-md border border-zinc-800 px-4 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-white px-6 py-2.5 text-xs font-bold text-black hover:bg-zinc-200 transition-colors"
                >
                  Save & Commit Application
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: CATEGORIES & TAGS */}
        {activeTab === 'tags' && (
          <div className="space-y-6 max-w-5xl">
            <div className="border-b border-zinc-900 pb-6">
              <h1 className="text-2xl font-bold text-white tracking-tight">Categories & Tags</h1>
              <p className="text-xs text-zinc-400 mt-1">
                Create and manage custom platform filters and categories for the marketplace.
              </p>
            </div>

            {/* Create Tag Form */}
            <form onSubmit={handleCreateTag} className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Create New Tag</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Tag Name</label>
                  <input
                    type="text"
                    value={newTag.name}
                    onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                    placeholder="e.g. Simulation, Audio Tools, Experimental"
                    required
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Type</label>
                  <select
                    value={newTag.type}
                    onChange={(e) => setNewTag({ ...newTag, type: e.target.value as any })}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white"
                  >
                    <option value="category">Category</option>
                    <option value="platform">Platform</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full rounded bg-white px-4 py-2 text-xs font-bold text-black hover:bg-zinc-200 transition-colors"
                  >
                    Create Tag
                  </button>
                </div>
              </div>
            </form>

            {/* Existing Tags Table */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-sm font-bold text-white mb-4">Active System Tags ({tags.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {tags.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-900"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{t.name}</span>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{t.type}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteTag(t.id)}
                      className="text-zinc-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STAFF MANAGEMENT (STRICTLY OWNER ONLY) */}
        {activeTab === 'staff' && isSuperAdmin && (
          <div className="space-y-6 max-w-5xl">
            <div className="border-b border-zinc-900 pb-6">
              <div className="inline-flex items-center gap-1.5 font-mono text-xs text-amber-400 uppercase tracking-wider mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                Owner Security Zone
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Staff Management</h1>
              <p className="text-xs text-zinc-400 mt-1">
                Authorize Google accounts as studio staff. Only the primary owner ({SUPER_ADMIN_EMAIL}) has authority over this registry.
              </p>
            </div>

            {/* Add Staff Member Form */}
            <form onSubmit={handleAddStaff} className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Authorize New Staff Member</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Google Email Address</label>
                  <input
                    type="email"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    placeholder="developer@gmail.com"
                    required
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Assigned Role</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as any)}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white"
                  >
                    <option value="administrator">Administrator (Manage apps & tags)</option>
                    <option value="developer">Developer (Create & edit software)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="rounded bg-white px-5 py-2 text-xs font-bold text-black hover:bg-zinc-200 transition-colors"
                >
                  Grant Staff Access
                </button>
              </div>
            </form>

            {/* Authorized Staff Table */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-sm font-bold text-white mb-4">Authorized Roster</h3>
              <div className="space-y-3">
                {/* Initial Super Admin Owner */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/60 border border-amber-900/40">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-300 font-bold text-xs">
                      ★
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{SUPER_ADMIN_EMAIL}</span>
                      <span className="text-[10px] font-mono text-amber-300">Initial Owner & Super Administrator</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Permanent Owner</span>
                </div>

                {/* Additional staff members */}
                {staffList.filter(s => s.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/30 border border-zinc-900"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{s.email}</span>
                      <span className="text-[10px] font-mono text-zinc-400 capitalize">{s.role}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveStaff(s)}
                      className="text-xs text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-red-950/40"
                    >
                      Revoke Access
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: WEBSITE SETTINGS */}
        {activeTab === 'settings' && config && (
          <div className="space-y-6 max-w-4xl">
            <div className="border-b border-zinc-900 pb-6">
              <h1 className="text-2xl font-bold text-white tracking-tight">Website Settings</h1>
              <p className="text-xs text-zinc-400 mt-1">
                Configure global studio messaging, public announcements, and contact links.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Homepage Content */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white">Homepage Branding</h3>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Headline</label>
                  <input
                    type="text"
                    value={config.headline}
                    onChange={(e) => setConfig({ ...config, headline: e.target.value })}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Subheadline</label>
                  <textarea
                    rows={2}
                    value={config.subheadline}
                    onChange={(e) => setConfig({ ...config, subheadline: e.target.value })}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={config.contactEmail}
                    onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Announcement Banner */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Top Announcement Banner</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        announcement: { ...config.announcement, enabled: !config.announcement.enabled }
                      })
                    }
                    className={`px-3 py-1 text-xs rounded font-bold ${
                      config.announcement.enabled ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {config.announcement.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Announcement Message</label>
                  <input
                    type="text"
                    value={config.announcement.text}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        announcement: { ...config.announcement, text: e.target.value }
                      })
                    }
                    placeholder="e.g. Mystery Dice v1.4.2 is now available."
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-sm text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">Link Label</label>
                    <input
                      type="text"
                      value={config.announcement.linkText || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          announcement: { ...config.announcement, linkText: e.target.value }
                        })
                      }
                      placeholder="e.g. Download Now"
                      className="w-full rounded bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">Link Target</label>
                    <input
                      type="text"
                      value={config.announcement.linkUrl || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          announcement: { ...config.announcement, linkUrl: e.target.value }
                        })
                      }
                      placeholder="e.g. /apps/mystery-dice"
                      className="w-full rounded bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white">Social Channel Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">GitHub</label>
                    <input
                      type="text"
                      value={config.socialLinks?.github || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socialLinks: { ...config.socialLinks, github: e.target.value }
                        })
                      }
                      className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">X (Twitter)</label>
                    <input
                      type="text"
                      value={config.socialLinks?.twitter || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socialLinks: { ...config.socialLinks, twitter: e.target.value }
                        })
                      }
                      className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">Discord</label>
                    <input
                      type="text"
                      value={config.socialLinks?.discord || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socialLinks: { ...config.socialLinks, discord: e.target.value }
                        })
                      }
                      className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="rounded-md bg-white px-6 py-2.5 text-xs font-bold text-black hover:bg-zinc-200 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
