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

export const FrameworkTree = () => {
  const [framework, setFramework] = useState<Framework | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingTarget | null>(null);

  const fetchFramework = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/framework");
      if (!res.ok) throw new Error("Failed to load framework");
      const data: Framework = await res.json();
      setFramework(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load framework");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFramework();
  }, [fetchFramework]);

  const updateFunction = useCallback(
    (functionIndex: number, payload: Partial<FrameworkFunction>) => {
      if (!framework) return;
      const next = shallowCloneFramework(framework);
      const fn = next.content.functions[functionIndex];
      if (!fn) return;
      next.content.functions[functionIndex] = { ...fn, ...payload };
      setFramework(next);
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
      setEditing(null);
    },
    [framework],
  );

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
        name: "New category",
        subcategories: [],
      };
      fn.categories.push(newCategory);
      setFramework(next);
      setEditing({
        type: "category",
        functionIndex,
        categoryIndex: fn.categories.length - 1,
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
        description: "New subcategory description",
        risk_level: "Medium",
      };
      cat.subcategories.push(newSub);
      setFramework(next);
      setEditing({
        type: "subcategory",
        functionIndex,
        categoryIndex,
        subcategoryIndex: cat.subcategories.length - 1,
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
      setEditing(null);
    },
    [framework],
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-zinc-500">Loading framework…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
        <p>{error}</p>
        <button type="button" onClick={fetchFramework} className="mt-2 text-sm font-medium underline">
          Retry
        </button>
      </div>
    );
  }
  if (!framework) {
    return null;
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
      </header>

      <div className="space-y-2">
        <h3 className="text-sm font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Functions</h3>
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
                  onCancel={() => setEditing(null)}
                  onDelete={() => deleteFunction(functionIndex)}
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
                            onCancel={() => setEditing(null)}
                            onDelete={() => deleteCategory(functionIndex, categoryIndex)}
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
                                      onCancel={() => setEditing(null)}
                                      onDelete={() => deleteSubcategory(functionIndex, categoryIndex, subcategoryIndex)}
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
      </div>
    </div>
  );
};

export default FrameworkTree;
