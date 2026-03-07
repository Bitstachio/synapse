import { FrameworkTree } from "@/components/FrameworkTree/FrameworkTree";
import Link from "next/link";

export const Home = () => {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm">
          <Link
            href="/frameworks"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Manage frameworks →
          </Link>
        </nav>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Synapse Framework Manager
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Edit the active framework: categories and subcategories. Switch which framework is active from
          the manage frameworks page.
        </p>
        <div className="mt-8">
          <FrameworkTree />
        </div>
      </main>
    </div>
  );
};

export default Home;
