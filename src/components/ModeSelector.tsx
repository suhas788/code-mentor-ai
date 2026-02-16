import { Baby, ShieldCheck } from "lucide-react";

export type ExplainMode = "eli5" | "senior";

interface ModeSelectorProps {
  mode: ExplainMode;
  onModeChange: (mode: ExplainMode) => void;
  disabled?: boolean;
}

const modes = [
  {
    id: "eli5" as const,
    label: "Explain Like I'm 5",
    description: "Simple, friendly, beginner-safe",
    icon: Baby,
  },
  {
    id: "senior" as const,
    label: "Senior Reviewer",
    description: "Blunt, detailed, constructive",
    icon: ShieldCheck,
  },
];

const ModeSelector = ({ mode, onModeChange, disabled }: ModeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {modes.map((m) => {
        const isActive = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            disabled={disabled}
            className={`group relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-300 ${
              isActive
                ? m.id === "eli5"
                  ? "border-primary bg-primary/10 glow-primary"
                  : "border-accent bg-accent/10 glow-accent"
                : "border-border bg-card hover:border-muted-foreground/30"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <m.icon
              className={`w-6 h-6 transition-colors ${
                isActive
                  ? m.id === "eli5"
                    ? "text-primary"
                    : "text-accent"
                  : "text-muted-foreground group-hover:text-foreground"
              }`}
            />
            <span
              className={`text-sm font-semibold transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {m.label}
            </span>
            <span className="text-xs text-muted-foreground/70">
              {m.description}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ModeSelector;
