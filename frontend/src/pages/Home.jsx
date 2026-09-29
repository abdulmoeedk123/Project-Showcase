import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjects } from '../api.js';
import ProjectCard from '../components/ProjectCard.jsx';

const steps = [
  { n: '1', title: 'Upload your work', text: 'Add screenshots, a description and tags for each internship project.' },
  { n: '2', title: 'Customize the card', text: 'Use the live editor preview to make your project look professional.' },
  { n: '3', title: 'Share one link', text: 'Send a single link to recruiters and employers.' },
];

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      setError('');
      getProjects({ q, tag })
        .then((list) => {
          setProjects(list);
          if (!q && !tag) {
            const counts = {};
            list.forEach((p) => p.tags.forEach((x) => (counts[x] = (counts[x] || 0) + 1)));
            setAllTags(Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 8));
          }
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q, tag]);

  return (
    <>
      {/* Hero */}
      <header className="bg-gradient-to-br from-blue-700 via-blue-700 to-blue-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <span className="mb-4 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            For Interns, By Interns
          </span>
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
            Showcase your internship projects to the world
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-blue-100">
            Build a professional portfolio, upload your work, and share a single link with recruiters and employers.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/editor" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
              Create Your Portfolio
            </Link>
            <a href="#projects" className="rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold transition hover:bg-white/10">
              Browse Projects
            </a>
          </div>
        </div>
      </header>

      {/* How it works */}
      <section className="mx-auto -mt-8 max-w-5xl px-4 sm:px-6">
        <div className="grid gap-4 rounded-xl border border-slate-100 bg-white p-6 shadow-md sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700">{s.n}</span>
              <div>
                <p className="font-semibold text-slate-900">{s.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Projects</h2>
            <p className="mt-1 text-sm text-slate-500">Real work from real interns</p>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, name or tag..."
            className="input mt-0 sm:w-72"
          />
        </div>

        {allTags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setTag('')}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${!tag ? 'bg-blue-700 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-blue-600'}`}
            >
              All
            </button>
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t === tag ? '' : t)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${tag === t ? 'bg-blue-700 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-blue-600'}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {error && <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        ) : projects.length === 0 && !error ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="font-semibold text-slate-700">No projects found</p>
            <p className="mt-1 text-sm text-slate-500">Be the first to add one!</p>
            <Link to="/editor" className="btn-primary mt-4">Add Project</Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
