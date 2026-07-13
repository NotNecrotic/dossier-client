import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Send, Loader2, ChevronsRight } from "lucide-react";
import { aiApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import { formatDuration, cx } from "@/lib/format";

const SUGGESTIONS = [
  "Where did I talk about upgrading my PC?",
  "Show me the Kyoto temple footage",
  "Find the design review from Q2",
  "Any clips about docker or containers?",
];

const AIPanel = () => {
  const { openVideoAt, setAiOpen, settings } = useStore();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Hi. Ask me anything about your video library — I'll surface the exact moment.",
      hits: [],
    },
  ]);
  const scrollerRef = useRef(null);

  const mutation = useMutation({
    mutationFn: (q) => aiApi.query(q),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer, hits: data.hits }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "The processing server is not reachable.", hits: [] },
      ]);
    },
  });

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, mutation.isPending]);

  const submit = (q) => {
    const query = (q ?? input).trim();
    if (!query || mutation.isPending) return;
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setInput("");
    mutation.mutate(query);
  };

  return (
    <div className="flex h-full flex-col bg-panel border-l border-app" data-testid="ai-panel">
      <div className="flex h-9 items-center justify-between border-b border-app px-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 accent-text" />
          <span className="font-heading text-[11px] font-semibold uppercase tracking-widest text-2nd">
            Assistant
          </span>
        </div>
        <button
          type="button"
          onClick={() => setAiOpen(false)}
          data-testid="ai-collapse-btn"
          title="Collapse"
          className="rounded-[3px] p-1 text-muted hover:bg-surface-hover hover:text-app transition-fast"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end" data-testid={`msg-user-${i}`}>
              <div className="max-w-[90%] rounded-[6px] border border-app bg-surface px-3 py-2 text-sm text-app">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex" data-testid={`msg-ai-${i}`}>
              <div className="w-full border-l-2 accent-border pl-3">
                <div className="text-sm text-app">{m.text}</div>
                {m.hits && m.hits.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {m.hits.map((h, k) => (
                      <button
                        type="button"
                        key={k}
                        onClick={() => openVideoAt(h.video_id, h.timestamp)}
                        data-testid={`ai-hit-${h.video_id}`}
                        className="group flex w-full items-center gap-2 rounded-full border border-app bg-surface px-3 py-1.5 text-left transition-fast hover:border-strong hover:bg-surface-hover hover:shadow-[0_0_0_3px_var(--accent-glow)]"
                      >
                        <span className="rounded-full accent-bg-soft accent-text px-2 py-0.5 font-mono text-[10px]">
                          {formatDuration(h.timestamp)}
                        </span>
                        <span className="flex-1 truncate text-xs text-app">
                          {h.video_title}
                        </span>
                        <ChevronsRight className="h-3 w-3 text-muted transition-fast group-hover:text-app group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}
        {mutation.isPending && (
          <div className="flex items-center gap-2 border-l-2 accent-border pl-3 text-xs text-2nd">
            <Loader2 className="h-3 w-3 animate-spin accent-text" />
            <span className="font-mono uppercase tracking-widest">Searching library…</span>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="border-t border-app px-3 py-3">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            Try asking
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                data-testid={`ai-suggestion-${s.slice(0, 10)}`}
                className="rounded-full border border-app bg-surface px-3 py-1 text-[11px] text-2nd transition-fast hover:border-strong hover:text-app hover:shadow-[0_0_0_3px_var(--accent-glow)]"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="border-t border-app p-3"
      >
        <div className="flex items-center gap-2 rounded-full border border-app bg-surface pl-4 pr-1.5 py-1.5 transition-fast focus-within:border-strong focus-within:shadow-[0_0_0_4px_var(--accent-glow)]">
          <Sparkles className="h-3.5 w-3.5 flex-shrink-0 accent-text opacity-70" />
          <input
            data-testid="ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={settings?.server_url ? "Ask about your videos…" : "Connect a server to enable AI…"}
            className="w-full bg-transparent text-sm text-app placeholder:text-muted outline-none caret-accent"
          />
          <button
            type="submit"
            data-testid="ai-send-btn"
            disabled={!input.trim() || mutation.isPending}
            className={cx(
              "flex h-8 w-8 items-center justify-center rounded-full transition-fast",
              input.trim() && !mutation.isPending
                ? "accent-bg text-black hover:opacity-90"
                : "bg-surface-hover text-muted"
            )}
            style={
              input.trim() && !mutation.isPending
                ? { boxShadow: "0 0 16px var(--accent-glow)" }
                : undefined
            }
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted">
          <span>Enter to send</span>
          <span className="flex items-center gap-1">
            <span
              className="h-1 w-1 rounded-full"
              style={{
                backgroundColor: settings?.server_url ? "var(--accent-500)" : "var(--text-muted)",
                boxShadow: settings?.server_url ? "0 0 6px var(--accent-500)" : "none",
              }}
            />
            {settings?.server_url ? "Connected" : "Offline mode"}
          </span>
        </div>
      </form>
    </div>
  );
};

export default AIPanel;
