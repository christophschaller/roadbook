import type { LucideIcon } from "lucide-react";

export function IconSwitch({
  checked,
  onChange,
  disabled = false,
  className = "",
  icon: Icon,
  color = [107, 114, 128], // Default gray color
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  icon?: LucideIcon;
  color?: number[];
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex h-8 w-14 items-center rounded-full transition-colors
        focus:outline-none
        ${checked ? "" : "bg-gray-200"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      style={{
        backgroundColor: checked ? `rgb(${color.join(",")})` : undefined,
      }}
    >
      <span
        className={`
          inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white transition-transform
          ${checked ? "translate-x-7" : "translate-x-1"}
        `}
      >
        {Icon && (
          <Icon
            className="w-4 h-4"
            color={checked ? `rgb(${color.join(",")})` : "#9CA3AF"}
          />
        )}
      </span>
    </button>
  );
}
