export const parseTags = (raw = '') =>
  [...new Set(raw.split(',').map((t) => t.trim()).filter(Boolean))].slice(0, 10);

export const shareUrl = (slug) => `${window.location.origin}/p/${slug}`;

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
