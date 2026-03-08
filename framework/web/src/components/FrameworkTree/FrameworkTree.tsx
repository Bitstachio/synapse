"use client";

import type { Category, Framework, FrameworkFunction, Subcategory } from "@/types/framework";
import { useCallback, useEffect, useState } from "react";
import CategoryEdit from "../CategoryEdit/CategoryEdit";
import CategoryView from "../CategoryView/CategoryView";
import FunctionEdit from "../FunctionEdit/FunctionEdit";
import FunctionView from "../FunctionView/FunctionView";
import SubcategoryEdit from "../SubcategoryEdit/SubcategoryEdit";
import SubcategoryView from "../SubcategoryView/SubcategoryView";
import { EditingTarget } from "./FrameworkTree.types";
import { shallowCloneFramework } from "./FrameworkTree.utils";
import { useActiveFramework, useFrameworkById, ACTIVE_FRAMEWORK_QUERY_KEY, frameworkByIdQueryKey } from "./useActiveFramework";
import { useAuth } from "@/lib/auth-context";
import {
  createFrameworkVersion,
  FrameworkConflictError,
  updateFrameworkVersion,
  type FrameworkWritePayload,
} from "@/lib/frameworks-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type FrameworkTreeProps = {
  /** When set, load and edit this framework by ID instead of the active one. */
  frameworkId?: string | null;
};

export const FrameworkTree = ({ frameworkId: frameworkIdProp }: FrameworkTreeProps = {}) => {
  const { isAuthenticated } = useAuth();
  const editById = frameworkIdProp ?? null;
  const activeQuery = useActiveFramework({ enabled: isAuthenticated && !editById });
  const byIdQuery = useFrameworkById(editById, { enabled: isAuthenticated && !!editById });
  const { data, isLoading, error } = editById ? byIdQuery : activeQuery;
  const [framework, setFramework] = useState<Framework | null>(null);
  const [frameworkId, setFrameworkId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingTarget | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EditingTarget | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (data) {
      setFramework(data.framework);
      setFrameworkId(data.id);
    }
  }, [data]);

  const toPayload = (fw: Framework): FrameworkWritePayload => ({
    name: fw.name,
    version: fw.version,
    content: fw.content,
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      next,
      lastKnownUpdatedAt,
      id,
    }: {
      next: Framework;
      lastKnownUpdatedAt: string | undefined;
      id: string | null;
    }) => {
      const payload = toPayload(next);
      if (id) {
        return updateFrameworkVersion(id, payload, {
          ...(lastKnownUpdatedAt && { lastKnownUpdatedAt }),
        });
      }
      return createFrameworkVersion(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVE_FRAMEWORK_QUERY_KEY });
      if (editById) {
        queryClient.invalidateQueries({ queryKey: frameworkByIdQueryKey(editById) });
        queryClient.invalidateQueries({ queryKey: ["frameworks", "list"] });
      }
    },
    onError: (err) => {
      if (err instanceof FrameworkConflictError) {
        setConflictMessage(
          "The framework was modified by someone else. It has been refreshed; please review and submit your changes again.",
        );
        const queryKey = editById ? frameworkByIdQueryKey(editById) : ACTIVE_FRAMEWORK_QUERY_KEY;
        queryClient.refetchQueries({ queryKey });
      }
    },
  });

  const updateFunction = useCallback(
    (functionIndex: number, payload: Partial<FrameworkFunction>) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      const fn = next.content.functions[functionIndex];
      if (!fn) return;
      next.content.functions[functionIndex] = { ...fn, ...payload };
      setFramework(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing(null);
    },
    [framework],
  );

  const deleteFunction = useCallback(
    (functionIndex: number) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      next.content.functions.splice(functionIndex, 1);
      setFramework(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing(null);
    },
    [framework],
  );

  const addFunction = useCallback(() => {
    if (!framework) return;
    const next = shallowCloneFramework(framework);
    const existingIds = next.content.functions.map((f) => f.id);
    let num = 1;
    while (existingIds.includes("F" + num)) num++;
    const newFunction: FrameworkFunction = {
      id: "F" + num,
      name: "New category",
      description: "",
      categories: [],
    };
    next.content.functions.push(newFunction);
    setFramework(next);
    saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
    setEditing({ type: "function", functionIndex: next.content.functions.length - 1, isNew: true });
  }, [framework, frameworkId]);

  const addCategory = useCallback(
    (functionIndex: number) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      const fn = next.content.functions[functionIndex];
      const prefix = fn.id + ".";
      const existingIds = fn.categories.map((c) => c.id);
      let num = 1;
      while (existingIds.includes(prefix + "C" + num)) num++;
      const newCategory: Category = {
        id: prefix + "C" + num,
        name: "New subcategory",
        subcategories: [],
      };
      fn.categories.push(newCategory);
      setFramework(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing({
        type: "category",
        functionIndex,
        categoryIndex: fn.categories.length - 1,
        isNew: true,
      });
    },
    [framework],
  );

  const updateCategory = useCallback(
    (functionIndex: number, categoryIndex: number, payload: Partial<Category>) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      const cat = next.content.functions[functionIndex].categories[categoryIndex];
      if (!cat) return;
      next.content.functions[functionIndex].categories[categoryIndex] = {
        ...cat,
        ...payload,
      };
      setFramework(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing(null);
    },
    [framework],
  );

  const deleteCategory = useCallback(
    (functionIndex: number, categoryIndex: number) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      next.content.functions[functionIndex].categories.splice(categoryIndex, 1);
      setFramework(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing(null);
    },
    [framework],
  );

  const addSubcategory = useCallback(
    (functionIndex: number, categoryIndex: number) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      const cat = next.content.functions[functionIndex].categories[categoryIndex];
      const prefix = cat.id;
      const existingIds = cat.subcategories.map((s) => s.id);
      let num = 1;
      while (existingIds.includes(prefix + num)) num++;
      const newSub: Subcategory = {
        id: prefix + num,
        description: "New instruction description",
        risk_level: "Medium",
      };
      cat.subcategories.push(newSub);
      setFramework(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing({
        type: "subcategory",
        functionIndex,
        categoryIndex,
        subcategoryIndex: cat.subcategories.length - 1,
        isNew: true,
      });
    },
    [framework],
  );

  const updateSubcategory = useCallback(
    (functionIndex: number, categoryIndex: number, subcategoryIndex: number, payload: Partial<Subcategory>) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      const sub = next.content.functions[functionIndex].categories[categoryIndex].subcategories[subcategoryIndex];
      if (!sub) return;
      next.content.functions[functionIndex].categories[categoryIndex].subcategories[subcategoryIndex] = {
        ...sub,
        ...payload,
      };
      setFramework(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing(null);
    },
    [framework],
  );

  const deleteSubcategory = useCallback(
    (functionIndex: number, categoryIndex: number, subcategoryIndex: number) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      next.content.functions[functionIndex].categories[categoryIndex].subcategories.splice(subcategoryIndex, 1);
      setFramework(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing(null);
    },
    [framework],
  );

  const getPendingDeleteLabel = useCallback((): string => {
    if (!framework || !pendingDelete) return "";
    if (pendingDelete.type === "function") {
      const fn = framework.content.functions[pendingDelete.functionIndex];
      return fn?.name ?? "this category";
    }
    if (pendingDelete.type === "category") {
      const cat = framework.content.functions[pendingDelete.functionIndex]?.categories[pendingDelete.categoryIndex];
      return cat?.name ?? "this subcategory";
    }
    const sub =
      framework.content.functions[pendingDelete.functionIndex]?.categories[pendingDelete.categoryIndex]
        ?.subcategories[pendingDelete.subcategoryIndex];
    if (!sub) return "this instruction";
    if (!sub.description.trim()) return sub.id;
    return sub.description.length > 50 ? sub.description.slice(0, 50) + "…" : sub.description;
  }, [framework, pendingDelete]);

  const handleConfirmDelete = useCallback(() => {
    if (!pendingDelete || !framework) return;
    if (pendingDelete.type === "function") {
      deleteFunction(pendingDelete.functionIndex);
    } else if (pendingDelete.type === "category") {
      deleteCategory(pendingDelete.functionIndex, pendingDelete.categoryIndex);
    } else {
      deleteSubcategory(
        pendingDelete.functionIndex,
        pendingDelete.categoryIndex,
        pendingDelete.subcategoryIndex,
      );
    }
    setPendingDelete(null);
  }, [pendingDelete, framework, deleteFunction, deleteCategory, deleteSubcategory]);

  const handleCancel = useCallback(() => {
    if (!editing || !framework) {
      setEditing(null);
      return;
    }
    if ("isNew" in editing && editing.isNew) {
      if (editing.type === "function") {
        const next = shallowCloneFramework(framework);
        next.content.functions.splice(editing.functionIndex, 1);
        setFramework(next);
        saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      } else if (editing.type === "category") {
        const next = shallowCloneFramework(framework);
        next.content.functions[editing.functionIndex].categories.splice(editing.categoryIndex, 1);
        setFramework(next);
        saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      } else {
        const next = shallowCloneFramework(framework);
        next.content.functions[editing.functionIndex].categories[editing.categoryIndex].subcategories.splice(
          editing.subcategoryIndex,
          1,
        );
        setFramework(next);
        saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      }
    }
    setEditing(null);
  }, [editing, framework, frameworkId]);

  if (isLoading || !framework) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-zinc-500">Loading framework…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
        <p>{error.message}</p>
      </div>
    );
  }

  if (!framework.content || !Array.isArray(framework.content.functions)) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-100">
        <p>Active framework is missing category definitions.</p>
      </div>
    );
  }

  const isEditingFunction = (i: number) => editing?.type === "function" && editing.functionIndex === i;
  const isEditingCategory = (fi: number, ci: number) =>
    editing?.type === "category" && editing.functionIndex === fi && editing.categoryIndex === ci;
  const isEditingSubcategory = (fi: number, ci: number, si: number) =>
    editing?.type === "subcategory" &&
    editing.functionIndex === fi &&
    editing.categoryIndex === ci &&
    editing.subcategoryIndex === si;

  return (
    <div className="space-y-6">
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
        >
          <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <h2 id="confirm-delete-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Remove this item?
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              &ldquo;{getPendingDeleteLabel()}&rdquo; will be removed. This cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      {conflictMessage && (
        <div
          className="fixed top-4 left-4 right-4 z-50 mx-auto flex max-w-4xl items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-lg text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100 sm:left-6 sm:right-6"
          role="alert"
        >
          <p className="text-sm font-medium">{conflictMessage}</p>
          <button
            type="button"
            onClick={() => setConflictMessage(null)}
            className="shrink-0 rounded p-1 text-amber-700 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900/50"
            aria-label="Dismiss"
          >
            <span className="sr-only">Dismiss</span>
            <span aria-hidden>×</span>
          </button>
        </div>
      )}
      <header className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{framework.name}</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Version {framework.version}
          {framework.isActive && (
            <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
              Active
            </span>
          )}
        </p>
        {framework.updatedAt && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Last updated:{" "}
            {new Date(framework.updatedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}
      </header>

      <div className="space-y-2">
        <h3 className="text-sm font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Categories</h3>
        {framework.content.functions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 p-8 text-center dark:border-zinc-600 dark:bg-zinc-900/30">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No categories yet. Add your first category to define subcategories and instructions.
            </p>
            <button
              type="button"
              onClick={addFunction}
              disabled={saveMutation.isPending}
              className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Add first category
            </button>
          </div>
        ) : (
          <>
        <ul className="space-y-3">
          {framework.content.functions.map((fn, functionIndex) => (
            <li
              key={fn.id}
              className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900/30"
            >
              {isEditingFunction(functionIndex) ? (
                <FunctionEdit
                  function={fn}
                  onSave={(payload) => updateFunction(functionIndex, payload)}
                  onCancel={handleCancel}
                  onDelete={() => setPendingDelete({ type: "function", functionIndex })}
                />
              ) : (
                <FunctionView
                  function={fn}
                  onEdit={() => setEditing({ type: "function", functionIndex })}
                  onAddCategory={() => addCategory(functionIndex)}
                  renderCategories={() =>
                    fn.categories.map((cat, categoryIndex) => (
                      <li key={cat.id} className="mt-2">
                        {isEditingCategory(functionIndex, categoryIndex) ? (
                          <CategoryEdit
                            category={cat}
                            onSave={(payload) => updateCategory(functionIndex, categoryIndex, payload)}
                            onCancel={handleCancel}
                            onDelete={() => setPendingDelete({ type: "category", functionIndex, categoryIndex })}
                          />
                        ) : (
                          <CategoryView
                            category={cat}
                            onEdit={() =>
                              setEditing({
                                type: "category",
                                functionIndex,
                                categoryIndex,
                              })
                            }
                            onAddSubcategory={() => addSubcategory(functionIndex, categoryIndex)}
                            renderSubcategories={() =>
                              cat.subcategories.map((sub, subcategoryIndex) => (
                                <li key={sub.id} className="mt-1">
                                  {isEditingSubcategory(functionIndex, categoryIndex, subcategoryIndex) ? (
                                    <SubcategoryEdit
                                      subcategory={sub}
                                      onSave={(payload) =>
                                        updateSubcategory(functionIndex, categoryIndex, subcategoryIndex, payload)
                                      }
                                      onCancel={handleCancel}
                                      onDelete={() =>
                                        setPendingDelete({
                                          type: "subcategory",
                                          functionIndex,
                                          categoryIndex,
                                          subcategoryIndex,
                                        })
                                      }
                                    />
                                  ) : (
                                    <SubcategoryView
                                      subcategory={sub}
                                      onEdit={() =>
                                        setEditing({
                                          type: "subcategory",
                                          functionIndex,
                                          categoryIndex,
                                          subcategoryIndex,
                                        })
                                      }
                                    />
                                  )}
                                </li>
                              ))
                            }
                          />
                        )}
                      </li>
                    ))
                  }
                />
              )}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={addFunction}
          disabled={saveMutation.isPending}
          className="mt-3 w-full rounded-lg border border-dashed border-zinc-300 py-3 text-sm font-medium text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
        >
          + Add category
        </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FrameworkTree;
