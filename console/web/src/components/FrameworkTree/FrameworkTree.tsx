"use client";

import { useAuth } from "@/lib/auth-context";
import { findFrameworkFocusElement, frameworkItemElementId } from "@/lib/framework-item-dom";
import { cn } from "@/lib/tailwind";
import {
  createFrameworkVersion,
  FrameworkConflictError,
  updateFrameworkVersion,
  type FrameworkWritePayload,
} from "@/lib/frameworks-api";
import type { Category, Framework, Instruction, Subcategory } from "@/types/framework";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { FRAMEWORK_FOCUS_HIGHLIGHT_CLASS } from "../framework-nodes/BaseFrameworkNode/BaseFrameworkNode";
import CategoryEdit from "../CategoryEdit/CategoryEdit";
import EditableCategoryView from "../CategoryView/EditableCategoryView/EditableCategoryView";
import InstructionEdit from "../InstructionEdit/InstructionEdit";
import SubcategoryEdit from "../SubcategoryEdit/SubcategoryEdit";
import EditableInstructionView from "../instruction-views/EditableInstructionView/EditableInstructionView";
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
  /** Category, subcategory, or instruction id to scroll to and highlight (`?focus=` on the edit page). */
  focusItemId?: string | null;
};

export const FrameworkTree = ({ frameworkId: frameworkIdProp, focusItemId }: FrameworkTreeProps = {}) => {
  const { isAuthenticated } = useAuth();
  const editById = frameworkIdProp ?? null;
  const activeQuery = useActiveFramework({ enabled: isAuthenticated && !editById });
  const byIdQuery = useFrameworkById(editById, { enabled: isAuthenticated && !!editById });
  const { data, isLoading, error } = editById ? byIdQuery : activeQuery;
  const [frameworkDraft, setFrameworkDraft] = useState<Framework | null>(null);
  const frameworkId = data?.id ?? null;
  const framework = frameworkDraft && frameworkDraft._id === data?.framework?._id ? frameworkDraft : (data?.framework ?? null);
  const [editing, setEditing] = useState<EditingTarget | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EditingTarget | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const normalizedFocusId = focusItemId?.trim() || null;
  const isFocusTarget = useCallback(
    (itemId: string) => normalizedFocusId !== null && itemId === normalizedFocusId,
    [normalizedFocusId],
  );

  useEffect(() => {
    if (!normalizedFocusId || !framework) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = findFrameworkFocusElement(normalizedFocusId);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
    return () => cancelAnimationFrame(id);
  }, [framework, normalizedFocusId]);

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
      setFrameworkDraft(null);
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
        setFrameworkDraft(null);
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
      setFrameworkDraft(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing(null);
    },
    [framework, frameworkId, saveMutation],
  );

  const deleteCategory = useCallback(
    (categoryIndex: number) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      next.content.categories.splice(categoryIndex, 1);
      setFrameworkDraft(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing(null);
    },
    [framework, frameworkId, saveMutation],
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
    setFrameworkDraft(next);
    setEditing({ type: "category", categoryIndex: next.content.categories.length - 1, isNew: true });
  }, [framework]);

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
      setFrameworkDraft(next);
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
      setFrameworkDraft(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing(null);
    },
    [framework, frameworkId, saveMutation],
  );

  const deleteSubcategory = useCallback(
    (categoryIndex: number, subcategoryIndex: number) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      next.content.categories[categoryIndex].subcategories.splice(subcategoryIndex, 1);
      setFrameworkDraft(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing(null);
    },
    [framework, frameworkId, saveMutation],
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
      setFrameworkDraft(next);
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
      setFrameworkDraft(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing(null);
    },
    [framework, frameworkId, saveMutation],
  );

  const deleteInstruction = useCallback(
    (categoryIndex: number, subcategoryIndex: number, instructionIndex: number) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      next.content.categories[categoryIndex].subcategories[subcategoryIndex].instructions.splice(instructionIndex, 1);
      setFrameworkDraft(next);
      saveMutation.mutate({ next, lastKnownUpdatedAt: framework?.updatedAt, id: frameworkId });
      setEditing(null);
    },
    [framework, frameworkId, saveMutation],
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
        setFrameworkDraft(next);
      } else if (editing.type === "subcategory") {
        const next = shallowCloneFramework(framework);
        next.content.categories[editing.categoryIndex].subcategories.splice(editing.subcategoryIndex, 1);
        setFrameworkDraft(next);
      } else {
        const next = shallowCloneFramework(framework);
        next.content.categories[editing.categoryIndex].subcategories[editing.subcategoryIndex].instructions.splice(
          editing.instructionIndex,
          1,
        );
        setFrameworkDraft(next);
      }
    }
    setEditing(null);
  }, [editing, framework]);

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
              {framework.content.categories.map((cat, categoryIndex) =>
                isEditingCategory(categoryIndex) ? (
                  <li
                    key={cat.id}
                    id={frameworkItemElementId("category", cat.id)}
                    className={cn(
                      "rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900/30",
                      isFocusTarget(cat.id) && FRAMEWORK_FOCUS_HIGHLIGHT_CLASS,
                    )}
                  >
                    <CategoryEdit
                      category={cat}
                      onSave={(payload) => updateCategory(categoryIndex, payload)}
                      onCancel={handleCancel}
                      onDelete={() => setPendingDelete({ type: "category", categoryIndex })}
                    />
                  </li>
                ) : (
                  <EditableCategoryView
                    key={cat.id}
                    category={cat}
                    domId={frameworkItemElementId("category", cat.id)}
                    highlighted={isFocusTarget(cat.id)}
                    onEdit={() => setEditing({ type: "category", categoryIndex })}
                    onAddSubcategory={() => addSubcategory(categoryIndex)}
                  >
                    {cat.subcategories.length > 0
                      ? cat.subcategories.map((sub, subcategoryIndex) =>
                          isEditingSubcategory(categoryIndex, subcategoryIndex) ? (
                            <li
                              key={sub.id}
                              id={frameworkItemElementId("subcategory", sub.id)}
                              className={cn(
                                "rounded",
                                isFocusTarget(sub.id) && FRAMEWORK_FOCUS_HIGHLIGHT_CLASS,
                              )}
                            >
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
                            </li>
                          ) : (
                            <EditableSubcategoryView
                              key={sub.id}
                              subcategory={sub}
                              domId={frameworkItemElementId("subcategory", sub.id)}
                              highlighted={isFocusTarget(sub.id)}
                              onEdit={() =>
                                setEditing({
                                  type: "subcategory",
                                  categoryIndex,
                                  subcategoryIndex,
                                })
                              }
                              onAddInstruction={() => addInstruction(categoryIndex, subcategoryIndex)}
                            >
                              {sub.instructions.length > 0
                                ? sub.instructions.map((inst, instructionIndex) =>
                                    isEditingInstruction(categoryIndex, subcategoryIndex, instructionIndex) ? (
                                      <li
                                        key={inst.id}
                                        id={frameworkItemElementId("instruction", inst.id)}
                                        className={cn(
                                          "rounded",
                                          isFocusTarget(inst.id) && FRAMEWORK_FOCUS_HIGHLIGHT_CLASS,
                                        )}
                                      >
                                        <InstructionEdit
                                          instruction={inst}
                                          onSave={(payload) =>
                                            updateInstruction(
                                              categoryIndex,
                                              subcategoryIndex,
                                              instructionIndex,
                                              payload,
                                            )
                                          }
                                          onCancel={handleCancel}
                                          onDelete={() =>
                                            setPendingDelete({
                                              type: "instruction",
                                              categoryIndex,
                                              subcategoryIndex,
                                              instructionIndex,
                                            })
                                          }
                                        />
                                      </li>
                                    ) : (
                                      <EditableInstructionView
                                        key={inst.id}
                                        instruction={inst}
                                        domId={frameworkItemElementId("instruction", inst.id)}
                                        highlighted={isFocusTarget(inst.id)}
                                        onEdit={() =>
                                          setEditing({
                                            type: "instruction",
                                            categoryIndex,
                                            subcategoryIndex,
                                            instructionIndex,
                                          })
                                        }
                                      />
                                    ),
                                  )
                                : null}
                            </EditableSubcategoryView>
                          ),
                        )
                      : null}
                  </EditableCategoryView>
                ),
              )}
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
