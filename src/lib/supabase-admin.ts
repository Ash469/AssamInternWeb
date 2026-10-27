import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
export const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'applications';

let supabaseAdminInstance: SupabaseClient | null = null;

/**
 * Returns a singleton instance of the Supabase Admin client with service role privileges.
 * NEVER expose this client to the frontend/browser.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn(
      '[Supabase Admin] Missing NEXT_PUBLIC_SUPABASE_URL or Supabase Key in environment variables.'
    );
  }

  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseAdminInstance;
}

export interface SignedUploadUrlResult {
  signedUrl: string;
  token?: string;
  path: string;
  storagePath: string;
  bucket: string;
}

/**
 * Creates a signed upload URL that allows a client (Flutter app or Web)
 * to upload a file directly to Supabase Storage without exposing backend keys.
 *
 * @param filePath Path inside bucket, e.g. "users/123/1698000000_photo.jpg"
 * @param expiresIn Expiration time in seconds (default: 300s / 5 mins)
 * @param bucket Storage bucket name (default: "applications")
 */
export async function createSignedUploadUrl(
  filePath: string,
  expiresIn: number = 300,
  bucket: string = DEFAULT_BUCKET
): Promise<SignedUploadUrlResult> {
  const supabase = getSupabaseAdmin();

  // Attempt to create signed upload URL
  let { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(filePath, {
      upsert: true,
    });

  // If bucket does not exist, try creating it automatically
  if (error && (error.message.includes('not found') || error.message.includes('Bucket'))) {
    try {
      await supabase.storage.createBucket(bucket, { public: true });
      const retry = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(filePath, { upsert: true });
      data = retry.data;
      error = retry.error;
    } catch (_) {
      // Ignore createBucket error and let standard error handling take over
    }
  }

  if (error || !data) {
    throw new Error(
      `Failed to create signed upload URL: ${error?.message || 'Unknown error'}. Make sure a bucket named '${bucket}' exists in your Supabase Storage.`
    );
  }

  // In Supabase, data.signedUrl might be relative or full URL
  let fullSignedUrl = data.signedUrl;
  if (!fullSignedUrl.startsWith('http')) {
    const cleanUrl = supabaseUrl.replace(/\/+$/, '');
    fullSignedUrl = `${cleanUrl}/storage/v1${data.signedUrl.startsWith('/') ? '' : '/'}${data.signedUrl}`;
  }

  return {
    signedUrl: fullSignedUrl,
    token: data.token,
    path: data.path,
    storagePath: filePath,
    bucket,
  };
}

/**
 * Gets a public URL for a given file path in Supabase storage.
 */
export function getPublicUrl(filePath: string, bucket: string = DEFAULT_BUCKET): string {
  const supabase = getSupabaseAdmin();
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Extracts clean relative storage path from any URL or raw path.
 */
export function extractStoragePath(urlOrPath: string, bucket: string = DEFAULT_BUCKET): string {
  if (!urlOrPath) return '';
  let clean = urlOrPath.trim();

  // If full Supabase URL provided
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const parsed = new URL(clean);
      const match = parsed.pathname.match(new RegExp(`/storage/v1/object/(?:public|sign)/[^/]+/(.+)`));
      if (match && match[1]) {
        clean = decodeURIComponent(match[1]);
      }
    } catch (_) {}
  }

  // Strip bucket prefix if present
  clean = clean.replace(new RegExp(`^/?${bucket}/?`), '');
  // Strip leading slash
  return clean.replace(/^\/+/, '');
}

/**
 * Creates a temporary, presigned download URL for private bucket objects.
 * Valid for the specified number of seconds (default 1 hour / 3600s).
 */
export async function createSignedDownloadUrl(
  filePath: string,
  expiresIn: number = 3600,
  bucket: string = DEFAULT_BUCKET
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const cleanPath = extractStoragePath(filePath, bucket);

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(cleanPath, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed download URL for "${cleanPath}": ${error?.message || 'Unknown error'}`);
  }

  let finalUrl = data.signedUrl;
  if (!finalUrl.startsWith('http')) {
    const cleanBase = supabaseUrl.replace(/\/+$/, '');
    finalUrl = `${cleanBase}/storage/v1${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;
  }

  return finalUrl;
}

/**
 * Verifies if a file exists in the bucket.
 */
export async function checkFileExists(
  filePath: string,
  bucket: string = DEFAULT_BUCKET
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    // Directory is the path before last slash, name is last segment
    const parts = filePath.split('/');
    const fileName = parts.pop();
    const folder = parts.join('/');

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        search: fileName,
      });

    if (error || !data) return false;
    return data.some((f) => f.name === fileName);
  } catch (err) {
    console.error('Error checking file existence in Supabase:', err);
    return false;
  }
}

/**
 * Uploads a file buffer directly to Supabase storage from the server.
 */
export async function uploadBufferDirect(
  filePath: string,
  buffer: Buffer | Uint8Array,
  contentType: string,
  bucket: string = DEFAULT_BUCKET
): Promise<{ publicUrl: string; storagePath: string }> {
  const supabase = getSupabaseAdmin();

  let { data, error } = await supabase.storage.from(bucket).upload(filePath, buffer, {
    contentType,
    upsert: true,
  });

  // If bucket does not exist, try creating it
  if (error && (error.message.includes('not found') || error.message.includes('Bucket'))) {
    try {
      await supabase.storage.createBucket(bucket, { public: true });
      const retry = await supabase.storage.from(bucket).upload(filePath, buffer, {
        contentType,
        upsert: true,
      });
      data = retry.data;
      error = retry.error;
    } catch (_) {}
  }

  if (error || !data) {
    throw new Error(`Direct upload failed: ${error?.message || 'Unknown error'}`);
  }

  return {
    storagePath: filePath,
  };
}

