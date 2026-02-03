interface StatBarProps {
  label: string;
  value: number;
  color: string;
}

export default function StatBar({ label, value, color }: StatBarProps) {
  return (
    <div className="flex items-center gap-2 text-base">
      <span className="w-14 shrink-0 text-gray-400 sm:w-20">{label}</span>
      <div
        className="h-3 flex-1 overflow-hidden border border-gray-700 bg-gray-900"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-8 text-right font-mono text-gray-300">{value}</span>
    </div>
  );
}
