"use client";

import { useAuth } from "@/lib/auth-context";
import {
  createFrameworkVersion,
  FrameworkConflictError,
  updateFrameworkVersion,
  type FrameworkWritePayload,
} from "@/lib/frameworks-api";
import type { Category, Framework, Instruction, Subcategory } from "@/types/framework";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import CategoryEdit from "../CategoryEdit/CategoryEdit";
import CategoryView from "../CategoryView/CategoryView";
import SubcategoryEdit from "../SubcategoryEdit/SubcategoryEdit";
import EditableSubcategoryView from "../subcategory-views/EditableSubcategoryView/EditableSubcategoryView";
import { EditingTarget } from "./FrameworkTree.types";
import { shallowCloneFramework } from "./FrameworkTree.utils";
import {
  ACTIVE_FRAMEWORK_QUERY_KEY,
  frameworkByIdQueryKey,
  useActiveFramework,
  useFrameworkById,
} from "./useActiveFramework";

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

  const updateCategory = useCallback(
    (categoryIndex: number, payload: Partial<Category>) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      const cat = next.content.categories[categoryIndex];
      if (!cat) return;
      next.content.categories[categoryIndex] = { ...cat, ...payload };
      setFramework(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing(null);
    },
    [framework],
  );

  const deleteCategory = useCallback(
    (categoryIndex: number) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      next.content.categories.splice(categoryIndex, 1);
      setFramework(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing(null);
    },
    [framework],
  );

  const addCategory = useCallback(() => {
    if (!framework) return;
    const next = shallowCloneFramework(framework);
    const existingIds = next.content.categories.map((c) => c.id);
    let num = 1;
    while (existingIds.includes("F" + num)) num++;
    const newCategory: Category = {
      id: "F" + num,
      name: "New category",
      description: "",
      subcategories: [],
    };
    next.content.categories.push(newCategory);
    setFramework(next);
    saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
    setEditing({ type: "category", categoryIndex: next.content.categories.length - 1, isNew: true });
  }, [framework, frameworkId]);

  const addSubcategory = useCallback(
    (categoryIndex: number) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      const cat = next.content.categories[categoryIndex];
      const prefix = cat.id + ".";
      const existingIds = cat.subcategories.map((c) => c.id);
      let num = 1;
      while (existingIds.includes(prefix + "C" + num)) num++;
      const newSubcategory: Subcategory = {
        id: prefix + "C" + num,
        name: "New subcategory",
        instructions: [],
      };
      cat.subcategories.push(newSubcategory);
      setFramework(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing({
        type: "subcategory",
        categoryIndex,
        subcategoryIndex: cat.subcategories.length - 1,
        isNew: true,
      });
    },
    [framework],
  );

  const updateSubcategory = useCallback(
    (categoryIndex: number, subcategoryIndex: number, payload: Partial<Subcategory>) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      const sub = next.content.categories[categoryIndex].subcategories[subcategoryIndex];
      if (!sub) return;
      next.content.categories[categoryIndex].subcategories[subcategoryIndex] = {
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
    (categoryIndex: number, subcategoryIndex: number) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      next.content.categories[categoryIndex].subcategories.splice(subcategoryIndex, 1);
      setFramework(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing(null);
    },
    [framework],
  );

  const addInstruction = useCallback(
    (categoryIndex: number, subcategoryIndex: number) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      const sub = next.content.categories[categoryIndex].subcategories[subcategoryIndex];
      const prefix = sub.id;
      const existingIds = sub.instructions.map((s) => s.id);
      let num = 1;
      while (existingIds.includes(prefix + num)) num++;
      const newInstruction: Instruction = {
        id: prefix + num,
        description: "New instruction description",
        risk_level: "Medium",
      };
      sub.instructions.push(newInstruction);
      setFramework(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing({
        type: "instruction",
        categoryIndex,
        subcategoryIndex,
        instructionIndex: sub.instructions.length - 1,
        isNew: true,
      });
    },
    [framework],
  );

  const updateInstruction = useCallback(
    (categoryIndex: number, subcategoryIndex: number, instructionIndex: number, payload: Partial<Instruction>) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      const inst =
        next.content.categories[categoryIndex].subcategories[subcategoryIndex].instructions[instructionIndex];
      if (!inst) return;
      next.content.categories[categoryIndex].subcategories[subcategoryIndex].instructions[instructionIndex] = {
        ...inst,
        ...payload,
      };
      setFramework(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing(null);
    },
    [framework],
  );

  const deleteInstruction = useCallback(
    (categoryIndex: number, subcategoryIndex: number, instructionIndex: number) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      next.content.categories[categoryIndex].subcategories[subcategoryIndex].instructions.splice(instructionIndex, 1);
      setFramework(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing(null);
    },
    [framework],
  );

  const getPendingDeleteLabel = useCallback((): string => {
    if (!framework || !pendingDelete) return "";
    if (pendingDelete.type === "category") {
      const cat = framework.content.categories[pendingDelete.categoryIndex];
      return cat?.name ?? "this category";
    }
    if (pendingDelete.type === "subcategory") {
      const sub =
        framework.content.categories[pendingDelete.categoryIndex]?.subcategories[pendingDelete.subcategoryIndex];
      return sub?.name ?? "this subcategory";
    }
    const inst =
      framework.content.categories[pendingDelete.categoryIndex]?.subcategories[pendingDelete.subcategoryIndex]
        ?.instructions[pendingDelete.instructionIndex];
    if (!inst) return "this instruction";
    if (!inst.description.trim()) return inst.id;
    return inst.description.length > 50 ? inst.description.slice(0, 50) + "…" : inst.description;
  }, [framework, pendingDelete]);

  const handleConfirmDelete = useCallback(() => {
    if (!pendingDelete || !framework) return;
    if (pendingDelete.type === "category") {
      deleteCategory(pendingDelete.categoryIndex);
    } else if (pendingDelete.type === "subcategory") {
      deleteSubcategory(pendingDelete.categoryIndex, pendingDelete.subcategoryIndex);
    } else {
      deleteInstruction(pendingDelete.categoryIndex, pendingDelete.subcategoryIndex, pendingDelete.instructionIndex);
    }
    setPendingDelete(null);
  }, [pendingDelete, framework, deleteCategory, deleteSubcategory, deleteInstruction]);

  const handleCancel = useCallback(() => {
    if (!editing || !framework) {
      setEditing(null);
      return;
    }
    if ("isNew" in editing && editing.isNew) {
      if (editing.type === "category") {
        const next = shallowCloneFramework(framework);
        next.content.categories.splice(editing.categoryIndex, 1);
        setFramework(next);
        saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      } else if (editing.type === "subcategory") {
        const next = shallowCloneFramework(framework);
        next.content.categories[editing.categoryIndex].subcategories.splice(editing.subcategoryIndex, 1);
        setFramework(next);
        saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      } else {
        const next = shallowCloneFramework(framework);
        next.content.categories[editing.categoryIndex].subcategories[editing.subcategoryIndex].instructions.splice(
          editing.instructionIndex,
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

  if (!framework.content || !Array.isArray(framework.content.categories)) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-100">
        <p>Active framework is missing category definitions.</p>
      </div>
    );
  }

  const isEditingCategory = (i: number) => editing?.type === "category" && editing.categoryIndex === i;
  const isEditingSubcategory = (ci: number, si: number) =>
    editing?.type === "subcategory" && editing.categoryIndex === ci && editing.subcategoryIndex === si;
  const isEditingInstruction = (ci: number, si: number, ii: number) =>
    editing?.type === "instruction" &&
    editing.categoryIndex === ci &&
    editing.subcategoryIndex === si &&
    editing.instructionIndex === ii;

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
          className="fixed top-4 right-4 left-4 z-50 mx-auto flex max-w-4xl items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-lg sm:right-6 sm:left-6 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
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
        {framework.content.categories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 p-8 text-center dark:border-zinc-600 dark:bg-zinc-900/30">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No categories yet. Add your first category to define subcategories and instructions.
            </p>
            <button
              type="button"
              onClick={addCategory}
              disabled={saveMutation.isPending}
              className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              aria-label="Add first category"
            >
              Add first category
            </button>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {framework.content.categories.map((cat, categoryIndex) => (
                <li
                  key={cat.id}
                  className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900/30"
                >
                  {isEditingCategory(categoryIndex) ? (
                    <CategoryEdit
                      category={cat}
                      onSave={(payload) => updateCategory(categoryIndex, payload)}
                      onCancel={handleCancel}
                      onDelete={() => setPendingDelete({ type: "category", categoryIndex })}
                    />
                  ) : (
                    <CategoryView
                      category={cat}
                      isEditable
                      onEdit={() => setEditing({ type: "category", categoryIndex })}
                      onAddSubcategory={() => addSubcategory(categoryIndex)}
                      renderSubcategories={() =>
                        cat.subcategories.map((sub, subcategoryIndex) => (
                          <li key={sub.id} className="mt-2">
                            {isEditingSubcategory(categoryIndex, subcategoryIndex) ? (
                              <SubcategoryEdit
                                subcategory={sub}
                                onSave={(payload) => updateSubcategory(categoryIndex, subcategoryIndex, payload)}
                                onCancel={handleCancel}
                                onDelete={() =>
                                  setPendingDelete({
                                    type: "subcategory",
                                    categoryIndex,
                                    subcategoryIndex,
                                  })
                                }
                              />
                            ) : (
                              <EditableSubcategoryView
                                subcategory={sub}
                                onEdit={() => setEditing({ type: "subcategory", categoryIndex, subcategoryIndex })}
                                onAddInstruction={() => {}}
                              />
                              // <SubcategoryView
                              //   subcategory={sub}
                              //   isEditable
                              //   onEdit={() =>
                              //     setEditing({
                              //       type: "subcategory",
                              //       categoryIndex,
                              //       subcategoryIndex,
                              //     })
                              //   }
                              //   onAddInstruction={() => addInstruction(categoryIndex, subcategoryIndex)}
                              //   renderInstructions={() =>
                              //     sub.instructions.map((inst, instructionIndex) => (
                              //       <li key={inst.id} className="mt-1">
                              //         {isEditingInstruction(categoryIndex, subcategoryIndex, instructionIndex) ? (
                              //           <InstructionEdit
                              //             instruction={inst}
                              //             onSave={(payload) =>
                              //               updateInstruction(
                              //                 categoryIndex,
                              //                 subcategoryIndex,
                              //                 instructionIndex,
                              //                 payload,
                              //               )
                              //             }
                              //             onCancel={handleCancel}
                              //             onDelete={() =>
                              //               setPendingDelete({
                              //                 type: "instruction",
                              //                 categoryIndex,
                              //                 subcategoryIndex,
                              //                 instructionIndex,
                              //               })
                              //             }
                              //           />
                              //         ) : (
                              //           // <EditableInstructionView
                              //           //   instruction={inst}
                              //           //   onEdit={() =>
                              //           //     setEditing({
                              //           //       type: "instruction",
                              //           //       categoryIndex,
                              //           //       subcategoryIndex,
                              //           //       instructionIndex,
                              //           //     })
                              //           //   }
                              //           // />
                              //           <RevisionInstructionView op={"add"} instruction={inst} />
                              //         )}
                              //       </li>
                              //     ))
                              //   }
                              // />
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
              onClick={addCategory}
              disabled={saveMutation.isPending}
              className="mt-3 w-full rounded-lg border border-dashed border-zinc-300 py-3 text-sm font-medium text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-500 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
              aria-label="Add category"
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
