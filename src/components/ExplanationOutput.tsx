import { Lightbulb, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ExplanationOutputProps {
  content: string;
  isLoading: boolean;
}

const ExplanationOutput = ({ content, isLoading }: ExplanationOutputProps) => {
  if (!content && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <Lightbulb className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground text-sm">
          Paste some code and hit <span className="text-primary font-semibold">Explain</span> to get started
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {isLoading && !content && (
        <div className="flex items-center gap-3 py-8 justify-center">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">Analyzing your code...</span>
        </div>
      )}

      {content && (
        <div className="prose prose-invert prose-sm max-w-none 
          prose-headings:text-foreground prose-headings:font-semibold
          prose-h2:text-primary prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-2
          prose-h3:text-accent prose-h3:text-base
          prose-p:text-secondary-foreground prose-p:leading-relaxed
          prose-code:text-primary prose-code:bg-code-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-xs
          prose-pre:bg-code-bg prose-pre:border prose-pre:border-border prose-pre:rounded-lg
          prose-strong:text-foreground
          prose-ul:text-secondary-foreground prose-ol:text-secondary-foreground
          prose-li:marker:text-primary
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        ">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}

      {isLoading && content && (
        <div className="flex items-center gap-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">Still thinking...</span>
        </div>
      )}
    </div>
  );
};

export default ExplanationOutput;
