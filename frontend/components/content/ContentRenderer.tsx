"use client";
import { useState } from "react";
import { Copy, Check, Info, AlertTriangle, Lightbulb } from "lucide-react";
import type { ContentBlock } from "@/types";

interface Props { blocks: ContentBlock[]; }

function FormulaBlock({ latex, display }: { latex: string; display: boolean }) {
  return (
    <div className={display ? "my-6 text-center" : "inline"}>
      <span className={`font-mono text-purple-300 px-2 py-1 rounded ${display ? "text-lg block" : "text-sm"}`}
        style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>
        {display ? `$$${latex}$$` : `$${latex}$`}
      </span>
    </div>
  );
}

function CodeBlock({ language, content }: { language: string; content: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <div className="my-4 rounded-xl overflow-hidden"
      style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between px-4 py-2"
        style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{language}</span>
        <button onClick={copy}
          className="flex items-center gap-1.5 text-xs transition-colors px-2 py-1 rounded-lg"
          style={{ color: copied ? "#10b981" : "#a78bfa" }}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-slate-300 font-mono leading-relaxed">{content}</pre>
    </div>
  );
}

function Callout({ variant, content }: { variant: "info" | "warning" | "tip"; content: string }) {
  const styles = {
    info:    { bg: "rgba(37,99,235,0.1)",   border: "rgba(37,99,235,0.25)",   color: "#93c5fd", Icon: Info },
    warning: { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  color: "#fcd34d", Icon: AlertTriangle },
    tip:     { bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  color: "#6ee7b7", Icon: Lightbulb },
  };
  const { bg, border, color, Icon } = styles[variant];
  return (
    <div className="my-4 p-4 rounded-xl flex gap-3" style={{ background: bg, border: `1px solid ${border}` }}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
      <p className="text-sm leading-relaxed" style={{ color }}>{content}</p>
    </div>
  );
}

const HEADING_SIZES = { 1: "text-2xl", 2: "text-xl", 3: "text-lg" } as const;

export default function ContentRenderer({ blocks }: Props) {
  return (
    <div className="prose max-w-none space-y-1">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading": {
            const lvl = (block.level ?? 2) as 1 | 2 | 3;
            const Tag = `h${lvl}` as "h1" | "h2" | "h3";
            return <Tag id={`h-${i}`} key={i} className={`${HEADING_SIZES[lvl]} font-bold text-white mt-8 mb-3 scroll-mt-24`}>{block.content}</Tag>;
          }
          case "text":
            return <p key={i} className="text-slate-300 leading-relaxed text-base">{block.content}</p>;
          case "formula":
            return <FormulaBlock key={i} latex={block.latex ?? ""} display={block.display ?? true} />;
          case "diagram":
            return (
              <div key={i} className="my-6 rounded-xl p-6 text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="text-slate-500 text-sm font-mono mb-2">Diagram</div>
                <pre className="text-xs text-slate-400 text-left overflow-x-auto">{block.spec}</pre>
                {block.caption && <p className="text-xs text-slate-500 mt-3 italic">{block.caption}</p>}
              </div>
            );
          case "code":
            return <CodeBlock key={i} language={block.language ?? ""} content={block.content ?? ""} />;
          case "callout": {
            const safeVariant = (["info", "warning", "tip"].includes(block.variant ?? "") ? block.variant : "info") as "info" | "warning" | "tip";
            return <Callout key={i} variant={safeVariant} content={block.content ?? ""} />;
          }
          case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            return (
              <ListTag key={i} className={`my-3 pl-5 space-y-1.5 text-slate-300 ${block.ordered ? "list-decimal" : "list-disc"}`}>
                {(block.items ?? []).map((item, j) => <li key={j} className="leading-relaxed text-sm">{item}</li>)}
              </ListTag>
            );
          }
          default: return null;
        }
      })}
    </div>
  );
}
