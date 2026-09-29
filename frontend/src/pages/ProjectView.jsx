import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProject, getKeys, imgUrl } from '../api.js';
import { copyText, shareUrl } from '../utils.js';

export default function ProjectView() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setProject(null);
    setError('');
    getProject(slug).then(setProject).catch((e) => setError(e.message));
  }, [slug]);

  if (error)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="font-semibold text-slate-800">{error}</p>
        <Link to="/" className="btn-primary mt-6">Back to home</Link>
      </div>
    );
  if (!project) return <div className="mx-auto max-w-5xl px-4 py-14"><div className="h-96 animate-pulse rounded-xl bg-slate-200" /></div>;

  const canEdit = Boolean(getKeys()[slug]);
  const copy = async () => {
    if (await copyText(shareUrl(slug))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link to="/" className="text-sm font-medium text-blue-700 hover:underline">← All projects</Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {project.images.length > 0 ? (
            <>
              <img src={imgUrl(project.images[active])} alt={project.title} className="aspect-video w-full rounded-xl border border-slate-200 bg-white object-cover" />
              {project.images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {project.images.map((im, i) => (
                    <button key={im} onClick={() => setActive(i)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${i === active ? 'border-blue-700' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                      <img src={imgUrl(im)} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 text-5xl font-bold text-white">
              {project.title.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <aside className="lg:col-span-2">
          <h1 className="text-2xl font-extrabold text-slate-900">{project.title}</h1>
          <p className="mt-1 text-sm font-medium text-blue-700">by {project.internName}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">{project.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn-primary">Live Demo</a>}
            {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" className="btn-outline">Source Code</a>}
          </div>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-semibold text-blue-900">Shareable link</p>
            <div className="mt-2 flex gap-2">
              <input readOnly value={shareUrl(slug)} className="input mt-0 text-xs" onFocus={(e) => e.target.select()} />
              <button onClick={copy} className="btn-primary px-3 text-xs">{copied ? 'Copied!' : 'Copy'}</button>
            </div>
          </div>

          {canEdit && <Link to={`/editor/${slug}`} className="btn-outline mt-4 w-full">Edit this project</Link>}
        </aside>
      </div>
    </div>
  );
}
