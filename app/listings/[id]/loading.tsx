export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 w-20 bg-neutral-200 rounded mb-3" />
      <div className="h-7 w-2/3 bg-neutral-200 rounded mb-2" />
      <div className="h-4 w-1/2 bg-neutral-200 rounded mb-6" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg bg-white p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-neutral-100 rounded" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="border rounded-lg bg-white p-4 h-32" />
          <div className="border rounded-lg bg-white p-4 h-48" />
        </div>
      </div>
    </div>
  );
}
