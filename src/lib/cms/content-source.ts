export type ContentSource = 'local' | 'supabase';

export function getContentSource(): ContentSource {
  const source = process.env.CONTENT_SOURCE?.trim().toLowerCase();

  if (!source || source === 'local') {
    return 'local';
  }

  if (source === 'supabase') {
    return 'supabase';
  }

  console.warn(`Unsupported CONTENT_SOURCE "${source}". Falling back to local content.`);
  return 'local';
}
