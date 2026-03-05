"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category, Framework, FrameworkFunction, RiskLevel, Subcategory } from "@/types/framework";

type EditingTarget =
  | { type: "function"; functionIndex: number }
  | { type: "category"; functionIndex: number; categoryIndex: number }
  | {
      type: "subcategory";
      functionIndex: number;
      categoryIndex: number;
      subcategoryIndex: number;
    };

const RISK_LEVELS: RiskLevel[] = ["Low", "Medium", "High", "Critical"];

function shallowCloneFramework(f: Framework): Framework {
  return {
    ...f,
    content: {
      ...f.content,
      functions: f.content.functions.map((fn) => ({
        ...fn,
        categories: fn.categories.map((cat) => ({
          ...cat,
          subcategories: [...cat.subcategories],
        })),
      })),
    },
  };
}

export function FrameworkTree() {
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
}

function FunctionView({
  function: fn,
  onEdit,
  onAddCategory,
  renderCategories,
}: {
  function: FrameworkFunction;
  onEdit: () => void;
  onAddCategory: () => void;
  renderCategories: () => React.ReactNode;
}) {
  return (
    <div className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">{fn.id}</span>
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{fn.name}</h4>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{fn.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onAddCategory}
            className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Add category
          </button>
        </div>
      </div>
      {fn.categories.length > 0 && (
        <ul className="mt-3 ml-4 border-l-2 border-zinc-200 pl-4 dark:border-zinc-600">{renderCategories()}</ul>
      )}
    </div>
  );
}

function FunctionEdit({
  function: fn,
  onSave,
  onCancel,
  onDelete,
}: {
  function: FrameworkFunction;
  onSave: (payload: Partial<FrameworkFunction>) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [id, setId] = useState(fn.id);
  const [name, setName] = useState(fn.name);
  const [description, setDescription] = useState(fn.description);

  const handleSave = () => {
    if (!id.trim() || !name.trim()) return;
    onSave({ id: id.trim(), name: name.trim(), description: description.trim() });
  };

  return (
    <div className="space-y-3 p-4">
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">ID</label>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-zinc-800 dark:text-red-300 dark:hover:bg-red-950/30"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function CategoryView({
  category,
  onEdit,
  onAddSubcategory,
  renderSubcategories,
}: {
  category: Category;
  onEdit: () => void;
  onAddSubcategory: () => void;
  renderSubcategories: () => React.ReactNode;
}) {
  return (
    <div className="rounded border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-800/30">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{category.id}</span>
          <h5 className="font-medium text-zinc-800 dark:text-zinc-200">{category.name}</h5>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onAddSubcategory}
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
          >
            Add subcategory
          </button>
        </div>
      </div>
      {category.subcategories.length > 0 && (
        <ul className="mt-2 ml-3 border-l-2 border-zinc-200 pl-3 dark:border-zinc-600">{renderSubcategories()}</ul>
      )}
    </div>
  );
}

function CategoryEdit({
  category,
  onSave,
  onCancel,
  onDelete,
}: {
  category: Category;
  onSave: (payload: Partial<Category>) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [id, setId] = useState(category.id);
  const [name, setName] = useState(category.name);

  const handleSave = () => {
    if (!id.trim() || !name.trim()) return;
    onSave({ id: id.trim(), name: name.trim() });
  };

  return (
    <div className="space-y-3 rounded border border-zinc-200 bg-white p-3 dark:border-zinc-600 dark:bg-zinc-800/50">
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">ID</label>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="rounded bg-zinc-900 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-zinc-700 dark:text-red-300 dark:hover:bg-red-950/30"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function SubcategoryView({ subcategory, onEdit }: { subcategory: Subcategory; onEdit: () => void }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 rounded border border-zinc-100 bg-white py-2 pr-2 pl-2 dark:border-zinc-700 dark:bg-zinc-900/30">
      <div className="min-w-0 flex-1">
        <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{subcategory.id}</span>
        <span
          className="ml-2 rounded px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
          title="Risk level"
        >
          {subcategory.risk_level}
        </span>
        <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">{subcategory.description}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      >
        Edit
      </button>
    </div>
  );
}

function SubcategoryEdit({
  subcategory,
  onSave,
  onCancel,
  onDelete,
}: {
  subcategory: Subcategory;
  onSave: (payload: Partial<Subcategory>) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [id, setId] = useState(subcategory.id);
  const [description, setDescription] = useState(subcategory.description);
  const [risk_level, setRiskLevel] = useState<RiskLevel>(subcategory.risk_level);

  const handleSave = () => {
    if (!id.trim() || !description.trim()) return;
    onSave({
      id: id.trim(),
      description: description.trim(),
      risk_level,
    });
  };

  return (
    <div className="space-y-3 rounded border border-zinc-200 bg-white p-3 dark:border-zinc-600 dark:bg-zinc-800/50">
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">ID</label>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Risk level</label>
        <select
          value={risk_level}
          onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {RISK_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="rounded bg-zinc-900 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-zinc-700 dark:text-red-300 dark:hover:bg-red-950/30"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
