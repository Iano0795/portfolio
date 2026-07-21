import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Plus, X } from 'lucide-react';
import type { EditableListItem } from './types';

type WriteupArrayFieldsProps = {
  disabled: boolean;
  items: EditableListItem[];
  label: string;
  placeholder: string;
  onChange: (items: EditableListItem[]) => void;
};

function createItem(value: string): EditableListItem {
  return {
    id: crypto.randomUUID(),
    value,
  };
}

export function WriteupArrayFields({ disabled, items, label, placeholder, onChange }: WriteupArrayFieldsProps) {
  const inputRefs = useRef(new Map<string, HTMLInputElement>());
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingFocusId) {
      return;
    }

    const input = inputRefs.current.get(pendingFocusId);

    if (input) {
      input.focus();
      setPendingFocusId(null);
    }
  }, [items, pendingFocusId]);

  const handleAdd = () => {
    if (disabled) {
      return;
    }

    const newItem = createItem('');
    onChange([...items, newItem]);
    setPendingFocusId(newItem.id);
  };

  const handleAddAfter = (index: number) => {
    if (disabled) {
      return;
    }

    const newItem = createItem('');
    const next = [...items];
    next.splice(index + 1, 0, newItem);
    onChange(next);
    setPendingFocusId(newItem.id);
  };

  const handleRemove = (itemId: string) => {
    if (disabled) {
      return;
    }

    onChange(items.filter((item) => item.id !== itemId));
  };

  const handleChange = (itemId: string, value: string) => {
    if (disabled) {
      return;
    }

    onChange(items.map((item) => (item.id === itemId ? { ...item, value } : item)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddAfter(index);
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block font-mono text-xs text-cyan-400">{label}</label>
        <button
          type="button"
          disabled={disabled}
          onClick={handleAdd}
          className="inline-flex items-center gap-1 border border-cyan-400/30 bg-cyan-400/5 px-2 py-1 font-mono text-[10px] text-cyan-300 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          Add
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 && (
          <div className="border border-dashed border-gray-700 bg-black/20 px-3 py-2 text-center font-mono text-xs text-gray-600">
            No items added yet
          </div>
        )}
        {items.map((item, index) => (
          <div key={item.id} className="flex gap-2">
            <input
              ref={(el) => {
                if (el) {
                  inputRefs.current.set(item.id, el);
                } else {
                  inputRefs.current.delete(item.id);
                }
              }}
              type="text"
              disabled={disabled}
              value={item.value}
              onChange={(e) => handleChange(item.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              placeholder={placeholder}
              className="min-w-0 flex-1 border border-cyan-400/20 bg-[#050812]/90 px-3 py-2 font-mono text-xs text-gray-200 placeholder-gray-600 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleRemove(item.id)}
              className="border border-[#ff5f56]/30 bg-[#ff5f56]/10 px-3 py-2 text-[#ff5f56] hover:bg-[#ff5f56]/20 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Remove"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
