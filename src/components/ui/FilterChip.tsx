'use client';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function FilterChip({ label, selected, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm cursor-pointer transition-colors border ${
        selected
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
      }`}
    >
      {label}
    </button>
  );
}
