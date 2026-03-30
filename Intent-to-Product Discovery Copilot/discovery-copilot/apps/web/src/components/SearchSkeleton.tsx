'use client';

export function SearchSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <div className="h-3 w-32 rounded bg-[#F5F5F4] animate-pulse" />
        <div className="h-7 w-80 rounded bg-[#F5F5F4] animate-pulse" />
        <div className="h-4 w-56 rounded bg-[#F5F5F4] animate-pulse" />
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-[#E7E5E4] p-6 space-y-4">
            <div className="h-6 w-24 rounded bg-[#F5F5F4] animate-pulse" />
            <div className="flex gap-5">
              <div className="w-28 h-28 rounded-xl bg-[#F5F5F4] animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-3 w-20 rounded bg-[#F5F5F4] animate-pulse" />
                <div className="h-5 w-64 rounded bg-[#F5F5F4] animate-pulse" />
                <div className="h-6 w-16 rounded bg-[#F5F5F4] animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-5 w-24 rounded bg-[#F5F5F4] animate-pulse" />
                  <div className="h-5 w-28 rounded bg-[#F5F5F4] animate-pulse" />
                </div>
              </div>
            </div>
            <div className="h-16 rounded-xl bg-[#FAFAF9] animate-pulse" />
          </div>

          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-[#E7E5E4] p-4 flex gap-4">
              <div className="w-20 h-20 rounded-lg bg-[#F5F5F4] animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 rounded bg-[#F5F5F4] animate-pulse" />
                <div className="h-4 w-48 rounded bg-[#F5F5F4] animate-pulse" />
                <div className="h-3 w-36 rounded bg-[#F5F5F4] animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block rounded-2xl border border-[#E7E5E4] p-5 space-y-5">
          <div className="h-4 w-32 rounded bg-[#F5F5F4] animate-pulse" />
          <div className="h-2 w-full rounded-full bg-[#F5F5F4] animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-3 w-full rounded bg-[#F5F5F4] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
