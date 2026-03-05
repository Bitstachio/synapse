"use client";

import { FrameworkFunction } from "@/types/framework";
import { useState } from "react";

type FunctionEditProps = {
  function: FrameworkFunction;
  onSave: (payload: Partial<FrameworkFunction>) => void;
  onCancel: () => void;
  onDelete: () => void;
};

const FunctionEdit = ({ function: fn, onSave, onCancel, onDelete }: FunctionEditProps) => {
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
};

export default FunctionEdit;
