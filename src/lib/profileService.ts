/**
 * Profile Service — Supabase CRUD + secure file uploads for avatars & resumes
 */
import { supabase } from './supabaseClient';
import type { UserProfileData } from '../types';

// ─── Allowed file configs ──────────────────────────────────
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_AVATAR_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB
const PDF_MAGIC_HEADER = [0x25, 0x50, 0x44, 0x46, 0x2D]; // %PDF-

// ─── Fetch Profile ─────────────────────────────────────────

export async function fetchUserProfile(userId: string): Promise<UserProfileData | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    // Profile might not exist yet (if trigger didn't fire)
    console.warn('[profileService] fetchUserProfile:', error.message);
    return null;
  }
  return data as UserProfileData;
}

// ─── Upsert Profile ────────────────────────────────────────

export async function upsertUserProfile(
  userId: string,
  fields: Partial<Omit<UserProfileData, 'id' | 'created_at'>>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      ...fields,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Upload Avatar (JPG/PNG only) ──────────────────────────

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  // 1. Extension check
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_AVATAR_EXTENSIONS.includes(ext)) {
    return { url: null, error: 'Only JPG and PNG image formats are allowed for profile pictures.' };
  }

  // 2. MIME type check
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return { url: null, error: 'Invalid image file type. Please use JPG or PNG.' };
  }

  // 3. Size check
  if (file.size > MAX_AVATAR_SIZE) {
    return { url: null, error: 'Profile picture must be under 2MB.' };
  }

  // 4. Magic bytes check (JPEG: FF D8 FF, PNG: 89 50 4E 47)
  const header = await readFileHeader(file, 8);
  const isJPEG = header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF;
  const isPNG = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47;
  if (!isJPEG && !isPNG) {
    return { url: null, error: 'File content does not match a valid JPG or PNG image.' };
  }

  // 5. Upload to Supabase Storage
  const filePath = `${userId}/avatar${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
  const publicUrl = urlData.publicUrl + '?t=' + Date.now(); // cache-bust

  // 6. Update profile with avatar URL
  await upsertUserProfile(userId, { avatar_url: publicUrl });

  return { url: publicUrl, error: null };
}

// ─── Upload Resume (PDF ONLY — triple validation) ──────────

export async function uploadResume(
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  // 1. Extension check
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return { url: null, error: 'Pdf is most professional way to send emails to HR or Recruiter' };
  }

  // 2. MIME type check
  if (file.type && file.type !== 'application/pdf') {
    return { url: null, error: 'Pdf is most professional way to send emails to HR or Recruiter' };
  }

  // 3. Size check
  if (file.size > MAX_RESUME_SIZE) {
    return { url: null, error: 'Resume must be under 5MB.' };
  }

  // 4. Magic header check — verify actual file content starts with %PDF-
  const header = await readFileHeader(file, 5);
  const isPDF = PDF_MAGIC_HEADER.every((byte, i) => header[i] === byte);
  if (!isPDF) {
    return { url: null, error: 'Pdf is most professional way to send emails to HR or Recruiter' };
  }

  // 5. Upload to Supabase Storage
  const filePath = `${userId}/resume.pdf`;
  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(filePath, file, { upsert: true, contentType: 'application/pdf' });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  // Get signed URL (private bucket)
  const { data: signedData, error: signedError } = await supabase.storage
    .from('resumes')
    .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

  if (signedError) {
    return { url: null, error: signedError.message };
  }

  // 6. Update profile with resume URL & filename
  await upsertUserProfile(userId, {
    resume_url: signedData.signedUrl,
    resume_filename: file.name,
  });

  return { url: signedData.signedUrl, error: null };
}

// ─── Delete Resume ─────────────────────────────────────────

export async function deleteResume(userId: string): Promise<{ error: string | null }> {
  const filePath = `${userId}/resume.pdf`;
  const { error } = await supabase.storage.from('resumes').remove([filePath]);
  if (error) return { error: error.message };

  await upsertUserProfile(userId, {
    resume_url: '',
    resume_filename: '',
    resume_skills: '',
    ats_score: 0,
    ats_analysis: {},
  });
  return { error: null };
}

// ─── Helper: Read first N bytes of a file ──────────────────

function readFileHeader(file: File, numBytes: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arr = new Uint8Array(reader.result as ArrayBuffer);
      resolve(arr.slice(0, numBytes));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file.slice(0, numBytes));
  });
}
