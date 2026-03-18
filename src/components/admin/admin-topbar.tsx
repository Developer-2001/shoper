export function AdminTopbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8 border-b border-slate-200 pb-4">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
      {subtitle ? <p className="mt-2 text-slate-600">{subtitle}</p> : null}
    </div>
  );
}
