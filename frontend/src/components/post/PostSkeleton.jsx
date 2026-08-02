export default function PostSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className="skeleton h-11 w-11 rounded-full" />
        <div className="space-y-2">
          <div className="skeleton h-3 w-32 rounded-full" />
          <div className="skeleton h-2.5 w-20 rounded-full" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-3 w-4/5 rounded-full" />
      </div>
      <div className="skeleton mt-4 h-48 w-full rounded-2xl" />
    </div>
  );
}
