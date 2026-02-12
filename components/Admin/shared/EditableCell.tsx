import { useState, useRef, useEffect } from 'react';

interface EditableCellProps {
  value: string;
  onCommit: (newValue: string) => void;
  className?: string;
}

export default function EditableCell({ value, onCommit, className = '' }: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    if (editValue !== value) {
      onCommit(editValue);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setEditValue(value); setEditing(false); }
        }}
        className={`w-full bg-blue/10 border border-blue/30 rounded px-1.5 py-0.5 text-text focus:outline-none text-xs ${className}`}
      />
    );
  }

  return (
    <span
      className={`cursor-default ${className}`}
      onDoubleClick={() => { setEditValue(value); setEditing(true); }}
    >
      {value || '—'}
    </span>
  );
}
