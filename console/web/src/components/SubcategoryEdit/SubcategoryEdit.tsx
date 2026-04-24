"use client";

import { Subcategory } from "@/types/framework";
import { useState } from "react";

type SubcategoryEditProps = {
  subcategory: Subcategory;
  onSave: (payload: Partial<Subcategory>) => void;
  onCancel: () => void;
  onDelete: () => void;
};

const SubcategoryEdit = ({ subcategory, onSave, onCancel, onDelete }: SubcategoryEditProps) => {
  const [id, setId] = useState(subcategory.id);
  const [name, setName] = useState(subcategory.name);

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
          className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
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
};

export default SubcategoryEdit;
