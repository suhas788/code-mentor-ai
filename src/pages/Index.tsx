import { useState, useCallback } from "react";
import CodeInput from "@/components/CodeInput";
import ModeSelector, { type ExplainMode } from "@/components/ModeSelector";
import ExplanationOutput from "@/components/ExplanationOutput";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw, Zap } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<ExplainMode>("eli5");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleExplain = useCallback(async () => {
    if (!code.trim()) {
      toast.error("Please paste some code first!");
      return;
    }

    setIsLoading(true);
    setExplanation("");

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/explain-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ code: code.trim(), mode }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        if (resp.status === 429) {
          toast.error("Rate limited — please wait a moment and try again.");
        } else if (resp.status === 402) {
          toast.error("AI usage limit reached. Please add credits in workspace settings.");
        } else {
          toast.error(err.error || "Something went wrong");
        }
        setIsLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setExplanation(fullText);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush remaining
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setExplanation(fullText);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to connect to AI service");
    } finally {
      setIsLoading(false);
    }
  }, [code, mode]);

  const handleReset = () => {
    setCode("");
    setExplanation("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Code<span className="text-gradient-primary">Whisper</span>
              </h1>
              <p className="text-xs text-muted-foreground -mt-0.5">
                AI-powered code explainer
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            Understand any code,{" "}
            <span className="text-gradient-primary">instantly</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Paste your code and get AI-powered explanations, complexity analysis,
            improved versions, and learning exercises.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Input */}
          <div className="space-y-5">
            <ModeSelector
              mode={mode}
              onModeChange={setMode}
              disabled={isLoading}
            />

            <CodeInput
              value={code}
              onChange={setCode}
              disabled={isLoading}
            />

            <div className="flex gap-3">
              <Button
                onClick={handleExplain}
                disabled={isLoading || !code.trim()}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-11 glow-primary"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isLoading ? "Analyzing..." : "Explain This Code"}
              </Button>

              {(code || explanation) && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="h-11 border-border hover:bg-secondary"
                  disabled={isLoading}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Right: Output */}
          <div className="rounded-lg border border-border bg-card p-6 min-h-[400px] overflow-y-auto max-h-[80vh]">
            <ExplanationOutput content={explanation} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
