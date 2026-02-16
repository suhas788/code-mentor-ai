import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Code2, Upload } from "lucide-react";

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CodeInput = ({ value, onChange, disabled }: CodeInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const lineCount = value.split("\n").length;

  return (
    <div
      className={`relative rounded-lg border transition-all duration-300 ${
        isFocused
          ? "border-primary/50 glow-primary"
          : "border-border hover:border-primary/30"
      } bg-code-bg overflow-hidden`}
    >
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/50">
        <Code2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-mono text-muted-foreground">
          paste your code here
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-accent/60" />
          <div className="w-3 h-3 rounded-full bg-primary/60" />
        </div>
      </div>

      {/* Editor area */}
      <div className="flex">
        {/* Line numbers */}
        <div className="select-none py-4 px-3 text-right border-r border-border/50 bg-code-bg">
          {Array.from({ length: Math.max(lineCount, 10) }, (_, i) => (
            <div
              key={i}
              className="text-xs font-mono leading-6 text-muted-foreground/40"
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code textarea */}
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={`// Paste any code here...\n// JavaScript, Python, TypeScript, Go, Rust...\n// I'll explain it all! 🚀\n\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}`}
          className="flex-1 min-h-[280px] resize-none border-0 bg-transparent font-mono text-sm leading-6 py-4 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground/30"
          maxLength={10000}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 bg-secondary/30">
        <span className="text-xs text-muted-foreground font-mono">
          {value.length > 0
            ? `${lineCount} lines · ${value.length} chars`
            : "Ready for code"}
        </span>
        <span className="text-xs text-muted-foreground/50">max 10,000 chars</span>
      </div>
    </div>
  );
};

export default CodeInput;
