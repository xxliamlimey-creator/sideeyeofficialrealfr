export type Platform = 'Windows' | 'Android' | 'Web' | 'Linux' | 'macOS' | 'iOS' | 'Cross-Platform';

export interface DownloadItem {
  id: string;
  platform: Platform | string;
  name: string;
  fileName: string;
  version: string;
  fileSize: string;
  fileUrl: string; // Direct download link or base64/cloud url
  releaseNotes?: string;
  downloadCount: number;
  uploadedAt: string;
}

export interface AppModel {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  iconUrl: string;
  developer: string;
  version: string;
  releaseDate: string;
  updatedAt: string;
  createdAt: string;
  platforms: (Platform | string)[];
  tags: string[];
  status: 'draft' | 'published';
  isFeatured: boolean;
  screenshots: string[];
  downloads: DownloadItem[];
  viewCount: number;
  downloadCount: number;
}

export type TagType = 'platform' | 'category' | 'custom';

export interface TagModel {
  id: string;
  name: string;
  description: string;
  type: TagType;
  color?: string;
  createdAt: string;
}

export type StaffRole = 'owner' | 'admin' | 'developer';

export interface StaffModel {
  id: string;
  email: string;
  role: StaffRole;
  displayName: string;
  addedAt: string;
  addedBy: string;
  isSuperAdmin: boolean;
}

export interface SiteConfigModel {
  id?: string;
  headline: string;
  subheadline: string;
  aboutBrief: string;
  aboutFull: string;
  contactEmail: string;
  announcement: {
    enabled: boolean;
    text: string;
    linkText?: string;
    linkUrl?: string;
  };
  socialLinks: {
    github?: string;
    twitter?: string;
    discord?: string;
    youtube?: string;
    bluesky?: string;
  };
  maintenanceMode: boolean;
  updatedAt: string;
}
