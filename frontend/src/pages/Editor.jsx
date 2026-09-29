import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createProject, getKeys, getProject, imgUrl, saveKey, updateProject } from '../api.js';
import { copyText, parseTags, shareUrl } from '../utils.js';
import ProjectCard from '../components/ProjectCard.jsx';

const MAX_IMAGES = 5;
const empty = { title: '', description: '', internName: '', tags: '', liveUrl: '', repoUrl: '' };

export default function Editor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(slug);

  const [form, setForm] = useState(empty);
  const [existing, setExisting] = useState([]); // images already saved on server
  const [removed, setRemoved] = useState([]);
  const [files, setFiles] = useState([]); // new File objects
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null); // { slug } after creating
  const [copied, setCopied] = useState(false);

  const editKey = isEdit ? getKeys()[slug] : null;

  useEffect(() => {
    if (!isEdit) return;
    getProject(slug)
      .then((p) => {
        setForm({
          title: p.title,
          description: p.description,
          internName: p.internName,
          tags: p.tags.join(', '),
          liveUrl: p.liveUrl || '',
          repoUrl: p.repoUrl || '',
        });
        setExisting(p.images);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug, isEdit]);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const keptExisting = existing.filter((i) => !removed.includes(i));
  const totalImages = keptExisting.length + files.length;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addFiles = (e) => {
    const picked = Array.from(e.target.files);
    e.target.value = '';
    const room = MAX_IMAGES - totalImages;
    if (picked.length > room) setError(`You can add ${Math.max(room, 0)} more image(s) (max ${MAX_IMAGES}).`);
    else setError('');
    setFiles((f) => [...f, ...picked.slice(0, Math.max(room, 0))]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append('images', f));

      if (isEdit) {
        fd.append('removeImages', JSON.stringify(removed));
        await updateProject(slug, fd, editKey);
        navigate(`/p/${slug}`);
      } else {
        const { project, editKey: key } = await createProject(fd);
        saveKey(project.slug, key);
        setDone({ slug: project.slug });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    if (await copyText(shareUrl(done.slug))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reset = () => {
    setForm(empty);
    setFiles([]);
    setDone(null);
  };

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-14"><div className="h-96 animate-pulse rounded-xl bg-slate-200" /></div>;

  if (isEdit && !editKey)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="font-semibold text-slate-800">You can only edit projects created in this browser.</p>
        <Link to={`/p/${slug}`} className="btn-primary mt-6">View project</Link>
      </div>
    );

  if (done)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-700">✓</div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Project published!</h1>
        <p className="mt-1 text-sm text-slate-500">Share this link with employers:</p>
        <div className="mt-4 flex gap-2">
          <input readOnly value={shareUrl(done.slug)} className="input mt-0 text-xs" onFocus={(e) => e.target.select()} />
          <button onClick={copy} className="btn-primary px-4 text-xs">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link to={`/p/${done.slug}`} className="btn-primary">View project</Link>
          <button onClick={reset} className="btn-outline">Add another</button>
        </div>
      </div>
    );

  const previewProject = {
    title: form.title || 'Your project title',
    description: form.description || 'Your description will appear here as you type.',
    internName: form.internName || 'Your name',
    tags: parseTags(form.tags),
    images: [...keptExisting, ...previews],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Project' : 'Add a Project to Your Portfolio'}</h1>
      <p className="mt-1 text-sm text-slate-500">Fill in the details — the preview updates live.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">Project title *</label>
              <input required maxLength={100} value={form.title} onChange={set('title')} className="input" placeholder="E-commerce Dashboard" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Your name *</label>
              <input required maxLength={60} value={form.internName} onChange={set('internName')} className="input" placeholder="Ali Khan" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Description *</label>
            <textarea required rows={5} maxLength={2000} value={form.description} onChange={set('description')} className="input" placeholder="What did you build and what did you learn?" />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Tags (comma separated)</label>
            <input value={form.tags} onChange={set('tags')} className="input" placeholder="React, Node.js, MongoDB" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">Live demo URL</label>
              <input type="url" value={form.liveUrl} onChange={set('liveUrl')} className="input" placeholder="https://..." />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Source code URL</label>
              <input type="url" value={form.repoUrl} onChange={set('repoUrl')} className="input" placeholder="https://github.com/..." />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Images ({totalImages}/{MAX_IMAGES})</label>
            <label className="mt-1 flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 transition hover:border-blue-600 hover:bg-blue-50">
              <span className="font-semibold text-blue-700">Click to upload</span>
              <span className="text-xs">PNG, JPG, WEBP or GIF, up to 5 MB each</span>
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple onChange={addFiles} className="hidden" />
            </label>

            {(keptExisting.length > 0 || files.length > 0) && (
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {keptExisting.map((im) => (
                  <Thumb key={im} src={imgUrl(im)} onRemove={() => setRemoved((r) => [...r, im])} />
                ))}
                {previews.map((src, i) => (
                  <Thumb key={src} src={src} onRemove={() => setFiles((f) => f.filter((_, x) => x !== i))} />
                ))}
              </div>
            )}
          </div>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Project'}
            </button>
            <Link to={isEdit ? `/p/${slug}` : '/'} className="btn-outline">Cancel</Link>
          </div>
        </form>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Live preview</p>
            <ProjectCard project={previewProject} preview />
          </div>
        </div>
      </div>
    </div>
  );
}

function Thumb({ src, onRemove }) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
      <img src={src} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-xs text-white opacity-0 transition group-hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
