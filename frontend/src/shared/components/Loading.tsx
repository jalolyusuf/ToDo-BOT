export function Loading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500"></div>
        <p className="text-sm text-slate-400">{message}</p>
      </div>
    </div>
  );
}
