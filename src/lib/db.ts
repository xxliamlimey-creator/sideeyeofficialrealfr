import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  onSnapshot
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';
import { AppModel, TagModel, StaffModel, SiteConfigModel, DownloadItem } from '../types';

export const INITIAL_TAGS: TagModel[] = [
  { id: 'windows', name: 'Windows', description: 'Native Windows desktop software', type: 'platform', color: '#38bdf8', createdAt: new Date().toISOString() },
  { id: 'android', name: 'Android', description: 'Android mobile apps and games', type: 'platform', color: '#4ade80', createdAt: new Date().toISOString() },
  { id: 'web', name: 'Web', description: 'Browser-based cloud applications', type: 'platform', color: '#facc15', createdAt: new Date().toISOString() },
  { id: 'linux', name: 'Linux', description: 'Linux workstation builds and packages', type: 'platform', color: '#fb923c', createdAt: new Date().toISOString() },
  { id: 'macos', name: 'macOS', description: 'Apple macOS native applications', type: 'platform', color: '#a78bfa', createdAt: new Date().toISOString() },
  { id: 'games', name: 'Games', description: 'Interactive PC and mobile games', type: 'category', color: '#f43f5e', createdAt: new Date().toISOString() },
  { id: 'productivity', name: 'Productivity', description: 'Focus and workflow tools', type: 'category', color: '#2dd4bf', createdAt: new Date().toISOString() },
  { id: 'utilities', name: 'Utilities', description: 'System enhancements and desktop tools', type: 'category', color: '#94a3b8', createdAt: new Date().toISOString() },
  { id: 'developer', name: 'Developer Tools', description: 'Built for programmers and engineers', type: 'category', color: '#818cf8', createdAt: new Date().toISOString() },
  { id: 'experimental', name: 'Experimental', description: 'Prototypes, lab projects, and audio tools', type: 'custom', color: '#e879f9', createdAt: new Date().toISOString() },
];

export const INITIAL_CONFIG: SiteConfigModel = {
  headline: 'Software made with a different perspective.',
  subheadline: 'SideEye Studio creates applications, games, and digital experiences designed to make technology more enjoyable and accessible.',
  aboutBrief: 'SideEye Studio is an independent software development company creating specialized desktop applications, Android software, video games, and web systems.',
  aboutFull: 'SideEye Studio was established to build software that defies generic templates. We specialize in native desktop engineering, tactical games, tactile mobile utilities, and developer productivity tools.\n\nOur philosophy combines uncompromising performance, dark-mode craftsmanship, and immediate responsiveness. We build the software we wish existed in our daily workflows.',
  contactEmail: 'contact@sideeyestudio.com',
  announcement: {
    enabled: true,
    text: 'Mystery Dice v1.4.2 is now available for Windows and Android with updated physics.',
    linkText: 'Download Now',
    linkUrl: '/apps/mystery-dice',
  },
  socialLinks: {
    github: 'https://github.com/sideeyestudio',
    twitter: 'https://x.com/sideeyestudio',
    discord: 'https://discord.gg/sideeyestudio',
  },
  maintenanceMode: false,
  updatedAt: new Date().toISOString(),
};

export const INITIAL_APPS: AppModel[] = [
  {
    id: 'mystery-dice',
    name: 'Mystery Dice',
    slug: 'mystery-dice',
    shortDescription: 'A tactical dice-rolling probability game featuring dark-fantasy relics, reactive physics, and randomized modifiers.',
    fullDescription: 'Mystery Dice is an atmospheric strategy and probability game developed for PC and Android. Step into the clandestine relic sanctum where every roll dictates survival. Features fully simulated 3D physical dice physics, over 60 unlockable relic modifiers, single-player challenge runs, and offline campaign progression.\n\nKey Highlights:\n• Real-time deterministic dice collisions and tactile audio feedback\n• Offline play supported on all platforms\n• Dynamic modifiers including Shadow Shard, Golden Eye, and Cursed D20\n• Zero ads, zero microtransactions',
    iconUrl: '/assets/aistudio/Stealthy_Eye_Emblem_40da80da.png',
    developer: 'SideEye Studio',
    version: '1.4.2',
    releaseDate: '2026-03-15',
    updatedAt: '2026-10-28',
    createdAt: '2026-03-10',
    platforms: ['Windows', 'Android'],
    tags: ['Games', 'Android', 'Windows'],
    status: 'published',
    isFeatured: true,
    screenshots: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
    ],
    downloads: [
      {
        id: 'md-win-64',
        platform: 'Windows',
        name: 'Windows 64-bit Installer',
        fileName: 'SideEye_MysteryDice_Setup_v1.4.2.exe',
        version: '1.4.2',
        fileSize: '54.8 MB',
        fileUrl: '#download-windows-exe',
        releaseNotes: 'Performance optimization for DirectX 12 renderers and added 8 new relic artifacts.',
        downloadCount: 3840,
        uploadedAt: '2026-10-28',
      },
      {
        id: 'md-android-apk',
        platform: 'Android',
        name: 'Android Universal APK',
        fileName: 'SideEye_MysteryDice_v1.4.2.apk',
        version: '1.4.2',
        fileSize: '42.1 MB',
        fileUrl: '#download-android-apk',
        releaseNotes: 'Added 120Hz refresh rate support for flagship mobile devices.',
        downloadCount: 7120,
        uploadedAt: '2026-10-28',
      }
    ],
    viewCount: 14250,
    downloadCount: 10960
  },
  {
    id: 'sideeye-command',
    name: 'SideEye Command',
    slug: 'sideeye-command',
    shortDescription: 'Minimalist system monitoring and rapid command launcher built for Windows and Linux workstations.',
    fullDescription: 'SideEye Command provides a distraction-free keyboard-centric overlay to monitor hardware telemetry, manage local developer servers, control audio channels, and execute custom workspace routines.\n\nDesigned with low memory footprint (< 18MB RAM) and zero telemetry, SideEye Command sits silently in your tray until summoned with a global hotkey.',
    iconUrl: '/assets/aistudio/Stealthy_Eye_Emblem_40da80da.png',
    developer: 'SideEye Studio',
    version: '2.1.0',
    releaseDate: '2026-01-20',
    updatedAt: '2026-11-01',
    createdAt: '2026-01-15',
    platforms: ['Windows', 'Linux'],
    tags: ['Utilities', 'Productivity', 'Developer Tools', 'Windows', 'Linux'],
    status: 'published',
    isFeatured: true,
    screenshots: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
    ],
    downloads: [
      {
        id: 'sec-win-zip',
        platform: 'Windows',
        name: 'Portable Windows Archive',
        fileName: 'SideEye_Command_v2.1.0_win64.zip',
        version: '2.1.0',
        fileSize: '16.4 MB',
        fileUrl: '#download-command-zip',
        releaseNotes: 'Introduced JSON snippet triggers and GPU temperature sensors.',
        downloadCount: 4210,
        uploadedAt: '2026-11-01',
      },
      {
        id: 'sec-linux-tar',
        platform: 'Linux',
        name: 'Linux Tarball (x86_64)',
        fileName: 'sideeye-command-2.1.0-amd64.tar.gz',
        version: '2.1.0',
        fileSize: '18.9 MB',
        fileUrl: '#download-command-linux',
        releaseNotes: 'Systemd service integration and Wayland overlay support.',
        downloadCount: 1890,
        uploadedAt: '2026-11-01',
      }
    ],
    viewCount: 9320,
    downloadCount: 6100
  },
  {
    id: 'pulsenote',
    name: 'PulseNote',
    slug: 'pulsenote',
    shortDescription: 'Instant markdown scratchpad with encrypted peer-to-peer sync, code highlighting, and zero bloat.',
    fullDescription: 'PulseNote is engineered for developers, writers, and technical creators who demand zero startup lag. Opens in less than 60 milliseconds. Backed by client-side AES-256 encryption, PulseNote never reads your notes and syncs frictionlessly between desktop and mobile devices.',
    iconUrl: '/assets/aistudio/Stealthy_Eye_Emblem_40da80da.png',
    developer: 'SideEye Studio',
    version: '1.0.8',
    releaseDate: '2026-05-12',
    updatedAt: '2026-10-14',
    createdAt: '2026-05-10',
    platforms: ['Windows', 'Android', 'Web'],
    tags: ['Productivity', 'Utilities', 'Web', 'Android', 'Windows'],
    status: 'published',
    isFeatured: true,
    screenshots: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80'
    ],
    downloads: [
      {
        id: 'pn-win-msi',
        platform: 'Windows',
        name: 'Windows MSI Package',
        fileName: 'PulseNote_v1.0.8_x64.msi',
        version: '1.0.8',
        fileSize: '22.3 MB',
        fileUrl: '#download-pulsenote-msi',
        releaseNotes: 'Vim keybinding mode and Mermaid diagram preview.',
        downloadCount: 2950,
        uploadedAt: '2026-10-14',
      },
      {
        id: 'pn-apk',
        platform: 'Android',
        name: 'Android Package APK',
        fileName: 'PulseNote_v1.0.8.apk',
        version: '1.0.8',
        fileSize: '14.5 MB',
        fileUrl: '#download-pulsenote-apk',
        releaseNotes: 'Biometric fingerprint lock and tablet split view.',
        downloadCount: 3410,
        uploadedAt: '2026-10-14',
      }
    ],
    viewCount: 6810,
    downloadCount: 6360
  },
  {
    id: 'vigil-audio-tools',
    name: 'Vigil Audio Tools',
    slug: 'vigil-audio-tools',
    shortDescription: 'Low-latency multi-bus audio routing suite and spectral analyzer for game sound designers.',
    fullDescription: 'Vigil Audio Tools gives audio engineers and game developers immediate control over system audio loops, spatial audio monitoring, and peak-limiting filters with a hardware-grade virtual interface.',
    iconUrl: '/assets/aistudio/Stealthy_Eye_Emblem_40da80da.png',
    developer: 'SideEye Studio',
    version: '0.9.4',
    releaseDate: '2026-08-01',
    updatedAt: '2026-09-20',
    createdAt: '2026-07-28',
    platforms: ['Windows'],
    tags: ['Utilities', 'Experimental', 'Windows'],
    status: 'published',
    isFeatured: false,
    screenshots: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80'
    ],
    downloads: [
      {
        id: 'vat-win-exe',
        platform: 'Windows',
        name: 'Windows 64-bit Standalone',
        fileName: 'VigilAudioTools_0.9.4_Setup.exe',
        version: '0.9.4',
        fileSize: '38.4 MB',
        fileUrl: '#download-vigil-exe',
        releaseNotes: 'ASIO buffer auto-tuning and low latency DSP filters.',
        downloadCount: 1420,
        uploadedAt: '2026-09-20',
      }
    ],
    viewCount: 3200,
    downloadCount: 1420
  }
];

// In-memory cache / fallback store to ensure zero-lag instant rendering
let localApps: AppModel[] = [...INITIAL_APPS];
let localTags: TagModel[] = [...INITIAL_TAGS];
let localConfig: SiteConfigModel = { ...INITIAL_CONFIG };
let localStaff: StaffModel[] = [
  {
    id: 'owner-super-admin',
    email: 'xxliamlimey@gmail.com',
    role: 'owner',
    displayName: 'Liam (Owner)',
    addedAt: '2026-01-01T00:00:00.000Z',
    addedBy: 'system',
    isSuperAdmin: true,
  }
];

// Helper to seed initial collections into Firestore if empty
export async function seedInitialDataIfEmpty() {
  try {
    const configRef = doc(db, 'settings', 'site_config');
    const configSnap = await getDoc(configRef);
    if (!configSnap.exists()) {
      await setDoc(configRef, INITIAL_CONFIG);
    }

    const tagsSnap = await getDocs(collection(db, 'tags'));
    if (tagsSnap.empty) {
      for (const tag of INITIAL_TAGS) {
        await setDoc(doc(db, 'tags', tag.id), tag);
      }
    }

    const appsSnap = await getDocs(collection(db, 'apps'));
    if (appsSnap.empty) {
      for (const app of INITIAL_APPS) {
        await setDoc(doc(db, 'apps', app.id), app);
      }
    }
  } catch {
    // If not authenticated or offline during initial load, fallback is maintained
  }
}

// ----------------- APPS -----------------

export async function fetchPublishedApps(): Promise<AppModel[]> {
  try {
    const q = query(
      collection(db, 'apps'),
      where('status', '==', 'published')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as AppModel));
      localApps = list;
      return list;
    }
    return localApps.filter(a => a.status === 'published');
  } catch {
    return localApps.filter(a => a.status === 'published');
  }
}

export async function fetchAllAppsForStaff(): Promise<AppModel[]> {
  try {
    const snap = await getDocs(collection(db, 'apps'));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as AppModel));
      localApps = list;
      return list;
    }
    return localApps;
  } catch {
    return localApps;
  }
}

export async function fetchAppBySlugOrId(idOrSlug: string): Promise<AppModel | null> {
  try {
    // Try by document ID first
    const docRef = doc(db, 'apps', idOrSlug);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id } as AppModel;
    }

    // Try by slug query
    const q = query(collection(db, 'apps'), where('slug', '==', idOrSlug));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const first = querySnap.docs[0];
      return { ...first.data(), id: first.id } as AppModel;
    }

    // Check local fallback
    const local = localApps.find(a => a.id === idOrSlug || a.slug === idOrSlug);
    return local || null;
  } catch {
    return localApps.find(a => a.id === idOrSlug || a.slug === idOrSlug) || null;
  }
}

export async function saveApp(appData: AppModel): Promise<void> {
  const appId = appData.id || appData.slug;
  const path = `apps/${appId}`;
  try {
    await setDoc(doc(db, 'apps', appId), {
      ...appData,
      id: appId,
      updatedAt: new Date().toISOString()
    });
    // Update local cache
    const idx = localApps.findIndex(a => a.id === appId);
    if (idx >= 0) {
      localApps[idx] = { ...appData, id: appId, updatedAt: new Date().toISOString() };
    } else {
      localApps.unshift({ ...appData, id: appId, updatedAt: new Date().toISOString() });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteAppById(appId: string): Promise<void> {
  const path = `apps/${appId}`;
  try {
    await deleteDoc(doc(db, 'apps', appId));
    localApps = localApps.filter(a => a.id !== appId);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function recordAppDownload(appId: string, downloadId: string): Promise<void> {
  try {
    const appRef = doc(db, 'apps', appId);
    await updateDoc(appRef, {
      downloadCount: increment(1)
    });
  } catch {
    // Silently continue if analytics write failed
  }
  // Local increment
  const app = localApps.find(a => a.id === appId);
  if (app) {
    app.downloadCount = (app.downloadCount || 0) + 1;
    const dl = app.downloads?.find(d => d.id === downloadId);
    if (dl) dl.downloadCount = (dl.downloadCount || 0) + 1;
  }
}

// ----------------- TAGS -----------------

export async function fetchAllTags(): Promise<TagModel[]> {
  try {
    const snap = await getDocs(collection(db, 'tags'));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as TagModel));
      localTags = list;
      return list;
    }
    return localTags;
  } catch {
    return localTags;
  }
}

export async function saveTag(tag: TagModel): Promise<void> {
  const path = `tags/${tag.id}`;
  try {
    await setDoc(doc(db, 'tags', tag.id), tag);
    const idx = localTags.findIndex(t => t.id === tag.id);
    if (idx >= 0) localTags[idx] = tag;
    else localTags.push(tag);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteTagById(tagId: string): Promise<void> {
  const path = `tags/${tagId}`;
  try {
    await deleteDoc(doc(db, 'tags', tagId));
    localTags = localTags.filter(t => t.id !== tagId);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ----------------- STAFF (OWNER ONLY) -----------------

export async function fetchAllStaff(): Promise<StaffModel[]> {
  try {
    const snap = await getDocs(collection(db, 'staff'));
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as StaffModel));
      localStaff = list;
      return list;
    }
    return localStaff;
  } catch {
    return localStaff;
  }
}

export async function saveStaffMember(staff: StaffModel): Promise<void> {
  const docId = staff.id || staff.email.replace(/[@.]/g, '_');
  const path = `staff/${docId}`;
  try {
    await setDoc(doc(db, 'staff', docId), {
      ...staff,
      id: docId
    });
    const idx = localStaff.findIndex(s => s.id === docId);
    if (idx >= 0) localStaff[idx] = { ...staff, id: docId };
    else localStaff.push({ ...staff, id: docId });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteStaffMember(staffId: string, email: string): Promise<void> {
  if (email.toLowerCase() === 'xxliamlimey@gmail.com') {
    throw new Error('The initial owner account xxliamlimey@gmail.com cannot be removed.');
  }
  const path = `staff/${staffId}`;
  try {
    await deleteDoc(doc(db, 'staff', staffId));
    localStaff = localStaff.filter(s => s.id !== staffId && s.email.toLowerCase() !== email.toLowerCase());
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ----------------- SETTINGS -----------------

export async function fetchSiteConfig(): Promise<SiteConfigModel> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'site_config'));
    if (snap.exists()) {
      const data = snap.data() as SiteConfigModel;
      localConfig = data;
      return data;
    }
    return localConfig;
  } catch {
    return localConfig;
  }
}

export async function saveSiteConfig(config: SiteConfigModel): Promise<void> {
  const path = 'settings/site_config';
  try {
    await setDoc(doc(db, 'settings', 'site_config'), {
      ...config,
      updatedAt: new Date().toISOString()
    });
    localConfig = { ...config, updatedAt: new Date().toISOString() };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Trigger initial seed check immediately in background
seedInitialDataIfEmpty().catch(() => {});
