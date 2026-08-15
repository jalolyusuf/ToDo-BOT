export function ErrorMessage({
  message,
  title = "Error",
  className = ""
}: {
  message: string;
  title?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-rose-700 bg-rose-950/20 p-4 text-rose-200 ${className}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
}
