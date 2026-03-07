"use client";

import { FrameworkTree } from "@/components/FrameworkTree/FrameworkTree";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function FrameworkEditPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;

  if (!id) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-zinc-600 dark:text-zinc-400">Invalid framework.</p>
          <Link href="/frameworks" className="mt-2 inline-block text-sm text-zinc-900 dark:text-zinc-100">
            ← Back to frameworks
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm">
          <Link
            href="/frameworks"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to frameworks
          </Link>
        </nav>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Edit framework
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Make changes to this framework. Save updates with the buttons in each section.
        </p>
        <div className="mt-8">
          <FrameworkTree frameworkId={id} />
        </div>
      </main>
    </div>
  );
}
