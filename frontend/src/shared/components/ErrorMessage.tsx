export function ErrorMessage({ message, title = "Error" }: { message: string; title?: string }) {
  return (
    <div className="rounded-lg border border-rose-700 bg-rose-950/20 p-4 text-rose-200">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
}
