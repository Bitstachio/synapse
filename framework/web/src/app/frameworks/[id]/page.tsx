"use client";

import { FrameworkTree } from "@/components/FrameworkTree/FrameworkTree";
import { ReturnToTop } from "@/components/ReturnToTop/ReturnToTop";
import {
  ACTIVE_FRAMEWORK_QUERY_KEY,
  frameworkByIdQueryKey,
  useFrameworkById,
} from "@/components/FrameworkTree/useActiveFramework";
import { activateFramework, deleteFramework } from "@/lib/frameworks-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function FrameworkEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = typeof params.id === "string" ? params.id : null;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: frameworkData } = useFrameworkById(id, { enabled: !!id });
  const isActive = frameworkData?.framework?.isActive ?? false;

  const deleteMutation = useMutation({
    mutationFn: () => deleteFramework(id!),
    onSuccess: () => {
      setShowDeleteConfirm(false);
      queryClient.invalidateQueries({ queryKey: ["frameworks", "list"] });
      queryClient.invalidateQueries({ queryKey: ACTIVE_FRAMEWORK_QUERY_KEY });
      if (id) queryClient.removeQueries({ queryKey: frameworkByIdQueryKey(id) });
      router.push("/frameworks");
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => activateFramework(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["frameworks", "list"] });
      queryClient.invalidateQueries({ queryKey: ACTIVE_FRAMEWORK_QUERY_KEY });
      if (id) queryClient.invalidateQueries({ queryKey: frameworkByIdQueryKey(id) });
    },
  });

  if (!id) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-zinc-600 dark:text-zinc-400">Invalid framework.</p>
          <Link href="/frameworks" className="mt-2 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            Frameworks
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-framework-title"
          >
            <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              <h2 id="confirm-delete-framework-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Delete framework?
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                This framework will be permanently deleted. This cannot be undone.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteMutation.isPending}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  {deleteMutation.isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        <Link
          href="/frameworks"
          className="mb-6 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to frameworks list
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Edit framework
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Make changes to this framework. Save updates with the buttons in each section.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isActive && (
              <button
                type="button"
                onClick={() => activateMutation.mutate()}
                disabled={activateMutation.isPending}
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {activateMutation.isPending ? "Activating…" : "Activate"}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-zinc-900/30 dark:text-red-300 dark:hover:bg-red-950/30"
            >
              Delete framework
            </button>
          </div>
        </div>
        <div className="mt-8">
          <FrameworkTree frameworkId={id} />
        </div>
      </main>
      <ReturnToTop />
    </div>
  );
}
