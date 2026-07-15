"use client";

export default function RootError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="border-2 border-black bg-card p-8 shadow-lg max-w-md w-full text-center">
        <p className="text-4xl mb-4">💥</p>
        <h1 className="font-head text-2xl font-black uppercase mb-2">Ada yang Error</h1>
        <p className="text-sm mb-6">Maaf, terjadi kesalahan. Coba lagi atau hubungi admin.</p>
        <button
          onClick={reset}
          className="border-2 border-black bg-primary px-6 py-3 font-bold text-white uppercase shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
