import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteProject, getKeys, getProject, imgUrl, removeKey } from '../api.js';
import { copyText, shareUrl } from '../utils.js';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const slugs = Object.keys(getKeys());
    if (!slugs.length) return setLoading(false);
    Promise.allSettled(slugs.map(getProject)).then((results) => {
      const ok = [];
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') ok.push(r.value);
        else if (r.reason?.message === 'Project not found') removeKey(slugs[i]);
      });
      setProjects(ok);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      await deleteProject(p.slug, getKeys()[p.slug]);
      removeKey(p.slug);
      setProjects((list) => list.filter((x) => x.slug !== p.slug));
    } catch (e) {
      setMessage(e.message);
    }
  };

  const handleCopy = async (slug) => {
    if (await copyText(shareUrl(slug))) {
      setMessage('Link copied to clipboard');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
          <p className="mt-1 text-sm text-slate-500">Projects you created in this browser</p>
        </div>
        <Link to="/editor" className="btn-primary">+ New Project</Link>
      </div>

      {message && <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}

      {loading ? (
        <div className="mt-6 h-32 animate-pulse rounded-xl bg-slate-200" />
      ) : projects.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="font-semibold text-slate-700">You have not added any projects yet</p>
          <Link to="/editor" className="btn-primary mt-4">Add your first project</Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {projects.map((p) => (
            <li key={p.slug} className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
              {p.images[0] ? (
                <img src={imgUrl(p.images[0])} alt="" className="h-20 w-32 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-900 font-bold text-white">
                  {p.title.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <Link to={`/p/${p.slug}`} className="font-bold text-slate-900 hover:text-blue-700">{p.title}</Link>
                <p className="truncate text-sm text-slate-500">{p.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleCopy(p.slug)} className="btn-outline px-3 py-2 text-xs">Copy link</button>
                <Link to={`/editor/${p.slug}`} className="btn-outline px-3 py-2 text-xs">Edit</Link>
                <button onClick={() => handleDelete(p)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
