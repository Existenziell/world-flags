import { WorldFlags } from "@/src/components/WorldFlags";

export default function Home() {
  const token = process.env.MAPBOX_ACCESS_TOKEN;

  if (!token) {
    return (
      <main className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <p className="rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm">
          Missing <code>MAPBOX_ACCESS_TOKEN</code> in <code>.env</code>.
        </p>
      </main>
    );
  }

  return (
    <main className="h-screen w-screen">
      <WorldFlags accessToken={token} />
    </main>
  );
}
