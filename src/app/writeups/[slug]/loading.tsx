export default function LoadingWriteup() {
  return (
    <main className="min-h-screen bg-[#050812] p-5 text-gray-200 md:p-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <div className="h-12 animate-pulse border border-cyan-400/20 bg-[#090d16]" />
        <div className="h-72 animate-pulse border border-cyan-400/20 bg-[#090d16]" />
        <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
          <div className="h-64 animate-pulse border border-cyan-400/20 bg-[#090d16]" />
          <div className="h-[620px] animate-pulse border border-cyan-400/20 bg-[#090d16]" />
          <div className="h-80 animate-pulse border border-cyan-400/20 bg-[#090d16]" />
        </div>
      </div>
    </main>
  );
}
