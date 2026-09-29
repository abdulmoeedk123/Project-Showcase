import { Link } from 'react-router-dom';
import { imgUrl } from '../api.js';

export default function ProjectCard({ project, preview = false }) {
  const cover = project.images?.[0];
  const Wrapper = preview ? 'div' : Link;
  const props = preview ? {} : { to: `/p/${project.slug}` };

  return (
    <Wrapper
      {...props}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-700/10"
    >
      {cover ? (
        <img src={imgUrl(cover)} alt={project.title} className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900 text-3xl font-bold text-white">
          {(project.title || 'P').slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-bold text-slate-900">{project.title}</h3>
        <p className="mt-0.5 text-xs font-medium text-blue-700">by {project.internName || 'Intern'}</p>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-500">{project.description}</p>
        {project.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {project.tags.slice(0, 4).map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        )}
      </div>
    </Wrapper>
  );
}
