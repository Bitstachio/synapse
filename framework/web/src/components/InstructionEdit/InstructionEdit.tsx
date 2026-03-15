"use client";

import { RISK_LEVELS } from "@/constants/framework";
import { Instruction, RiskLevel } from "@/types/framework";
import { useState } from "react";

type InstructionEditProps = {
  instruction: Instruction;
  onSave: (payload: Partial<Instruction>) => void;
  onCancel: () => void;
  onDelete: () => void;
};

const InstructionEdit = ({ instruction, onSave, onCancel, onDelete }: InstructionEditProps) => {
  const [id, setId] = useState(instruction.id);
  const [description, setDescription] = useState(instruction.description);
  const [risk_level, setRiskLevel] = useState<RiskLevel>(instruction.risk_level);

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
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Instruction
      </p>
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
          className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
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

export default InstructionEdit;
