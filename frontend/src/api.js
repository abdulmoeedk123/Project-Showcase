const BASE = import.meta.env.VITE_API_URL || '';

export const imgUrl = (p) => (!p ? '' : /^(https?:|blob:)/.test(p) ? p : BASE + p);

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export const getProjects = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return request(`/projects${qs ? `?${qs}` : ''}`);
};
export const getProject = (slug) => request(`/projects/${slug}`);
export const createProject = (formData) => request('/projects', { method: 'POST', body: formData });
export const updateProject = (slug, formData, key) =>
  request(`/projects/${slug}`, { method: 'PUT', body: formData, headers: { 'x-edit-key': key } });
export const deleteProject = (slug, key) =>
  request(`/projects/${slug}`, { method: 'DELETE', headers: { 'x-edit-key': key } });

// Edit keys are kept in this browser so the creator can edit/delete later.
const KEYS = 'intern_showcase_keys';
export const getKeys = () => {
  try {
    return JSON.parse(localStorage.getItem(KEYS)) || {};
  } catch {
    return {};
  }
};
export const saveKey = (slug, key) => localStorage.setItem(KEYS, JSON.stringify({ ...getKeys(), [slug]: key }));
export const removeKey = (slug) => {
  const k = getKeys();
  delete k[slug];
  localStorage.setItem(KEYS, JSON.stringify(k));
};
