import { FrameworkTree } from "@/components/FrameworkTree/FrameworkTree";

export const Home = () => {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Synapse Framework Manager
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Edit categories and subcategories, or add new ones. Changes are kept in memory until you connect to the real
          API.
        </p>
        <div className="mt-8">
          <FrameworkTree />
        </div>
      </main>
    </div>
  );
};

export default Home;
