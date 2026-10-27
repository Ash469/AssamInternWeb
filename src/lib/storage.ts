/**
 * Modular Storage Service
 * Supports:
 *  1. Supabase Storage (current)
 *  2. Cloudflare R2 (future transition ready)
 * 
 * Configured via process.env.STORAGE_PROVIDER ("supabase" | "r2")
 */

import {
  createSignedUploadUrl as supabaseCreateUploadUrl,
  createSignedDownloadUrl as supabaseCreateDownloadUrl,
  checkFileExists as supabaseCheckExists,
  DEFAULT_BUCKET,
  SignedUploadUrlResult,
} from './supabase-admin';

export type StorageProviderType = 'supabase' | 'r2';

export interface GenerateUploadUrlParams {
  fileName: string;
  fileType: string;
  userId?: string;
  district?: string;
  fullName?: string;
  userName?: string;
  category?: string;
  folder?: string;
  expiresInSeconds?: number;
}

export interface UploadUrlResponse {
  provider: StorageProviderType;
  signedUrl: string;
  method: 'PUT' | 'POST';
  token?: string;
  storagePath: string;
  headers?: Record<string, string>;
  expiresInSeconds: number;
}

export interface GenerateStoragePathParams {
  fileName: string;
  district?: string;
  fullName?: string;
  userName?: string;
  userId?: string;
  folder?: string;
}

/**
 * Sanitizes a path segment to be safe across filesystems and cloud storage URLs.
 */
export function sanitizePathSegment(value?: string, fallback: string = 'General'): string {
  if (!value || !value.trim()) return fallback;
  return value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || fallback;
}

/**
 * Generates an organized, hierarchical storage path:
 * Pattern: applications/{district}/{personName}/{timestamp}_{suffix}_{cleanFileName}
 * Example: applications/Kamrup_Metropolitan/Rahul_Barman/1730000000000_a1b2c3_sign.jpg
 */
export function generateStoragePath(params: GenerateStoragePathParams): string {
  const folder = params.folder || 'applications';
  const districtSegment = sanitizePathSegment(params.district, 'General_District');
  const personSegment = sanitizePathSegment(
    params.fullName || params.userName || params.userId,
    'Citizen'
  );
  const cleanFileName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  return `${folder}/${districtSegment}/${personSegment}/${timestamp}_${randomSuffix}_${cleanFileName}`;
}

/**
 * Extension to MIME type mapping
 */
const EXTENSION_MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  avi: 'video/x-msvideo',
  mpeg: 'video/mpeg',
  mpg: 'video/mpeg',
};

const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/bmp',
  'image/svg+xml',
  'image/pjpeg',
  'image/x-png',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  // Videos
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/mpeg',
  'video/x-msvideo',
  'video/3gpp',
];

/**
 * Infers accurate MIME type from file name or provided type
 */
export function resolveMimeType(fileName: string, providedType?: string): string {
  const cleanType = (providedType || '').toLowerCase().split(';')[0].trim();
  if (cleanType && cleanType !== 'application/octet-stream' && cleanType !== '') {
    return cleanType;
  }

  const ext = (fileName || '').split('.').pop()?.toLowerCase() || '';
  return EXTENSION_MIME_MAP[ext] || 'application/octet-stream';
}

/**
 * Validates file type and size against application constraints.
 * Supports both MIME type and file extension detection.
 */
export function validateUploadFile(
  fileType: string,
  fileSize?: number,
  fileName?: string
): { valid: boolean; error?: string; resolvedType: string } {
  const resolvedType = resolveMimeType(fileName || '', fileType);
  const ext = (fileName || '').split('.').pop()?.toLowerCase() || '';

  const isAllowedMime = ALLOWED_MIME_TYPES.includes(resolvedType);
  const isAllowedExt = Boolean(ext && EXTENSION_MIME_MAP[ext]);

  // If neither the MIME type nor the extension matches allowed formats
  if (!isAllowedMime && !isAllowedExt && resolvedType !== 'application/octet-stream') {
    return {
      valid: false,
      resolvedType,
      error: `File type "${fileType || ext}" is not supported. Allowed formats: JPG, PNG, WEBP, PDF, DOC, MP4.`,
    };
  }

  // 50MB max limit
  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  if (fileSize && fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      resolvedType,
      error: `File exceeds maximum allowed limit of 50MB. (Received ${(fileSize / (1024 * 1024)).toFixed(1)}MB)`,
    };
  }

  return { valid: true, resolvedType };
}

/**
 * Unified method to generate a signed upload URL regardless of backend provider.
 */
export async function getSignedUploadUrl(
  params: GenerateUploadUrlParams
): Promise<UploadUrlResponse> {
  const provider = (process.env.STORAGE_PROVIDER as StorageProviderType) || 'supabase';
  const expiresIn = params.expiresInSeconds || 300; // 5 minutes default
  const storagePath = generateStoragePath({
    fileName: params.fileName,
    district: params.district,
    fullName: params.fullName || params.userName,
    userId: params.userId,
    folder: params.folder || 'applications',
  });

  if (provider === 'r2') {
    // Cloudflare R2 Implementation Hook (Ready for future switch)
    // To enable Cloudflare R2: install @aws-sdk/client-s3 & @aws-sdk/s3-request-presigner
    // and provide R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
    throw new Error('Cloudflare R2 provider selected but not configured yet. Set STORAGE_PROVIDER=supabase in .env');
  }

  // Default: Supabase Storage
  const supabaseResult: SignedUploadUrlResult = await supabaseCreateUploadUrl(
    storagePath,
    expiresIn,
    process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET
  );

  return {
    provider: 'supabase',
    signedUrl: supabaseResult.signedUrl,
    method: 'PUT',
    token: supabaseResult.token,
    storagePath: supabaseResult.storagePath || supabaseResult.path,
    headers: {
      'Content-Type': params.fileType,
    },
    expiresInSeconds: expiresIn,
  };
}

/**
 * Unified method to verify file exists and retrieve its access URL.
 */
export async function verifyAndResolveFile(storagePath: string): Promise<{
  exists: boolean;
  storagePath: string;
}> {
  const provider = (process.env.STORAGE_PROVIDER as StorageProviderType) || 'supabase';

  if (provider === 'r2') {
    throw new Error('Cloudflare R2 not configured yet.');
  }

  const exists = await supabaseCheckExists(storagePath);

  return {
    exists,
    storagePath,
  };
}
