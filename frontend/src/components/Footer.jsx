export default function Footer() {
  return (
    <footer className="bg-slate-900 text-sm text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-8 sm:flex-row sm:px-6">
        <span>© {new Date().getFullYear()} InternShowcase</span>
        <span className="text-slate-500">Made for interns, by interns</span>
      </div>
    </footer>
  );
}
