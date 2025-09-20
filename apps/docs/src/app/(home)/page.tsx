import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center text-center gap-4 py-12">
      <h1 className="text-3xl font-bold">Drizzleasy</h1>
      <p className="max-w-2xl text-fd-muted-foreground">
        Ultra-simple, type-safe CRUD operations for Next.js with Drizzle ORM.
      </p>
      <div className="flex gap-3">
        <Link
          href="/docs"
          className="rounded-md bg-fd-foreground px-4 py-2 text-fd-background font-medium"
        >
          Get Started
        </Link>
        <a
          href="https://github.com/remcostoeten/drizzleasy"
          className="rounded-md border px-4 py-2"
        >
          GitHub
        </a>
      </div>
    </main>
  );
}
