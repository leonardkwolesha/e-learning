"use client";
import Link from "next/link";
import { CheckCircle2, Circle, Lock, PlayCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Chapter } from "@/types";

interface Props {
  chapters: Chapter[];
}

const statusIcon = {
  completed: CheckCircle2,
  in_progress: PlayCircle,
  available: Circle,
  locked: Lock,
};

const statusColor = {
  completed: "#10b981",
  in_progress: "#7c3aed",
  available: "#94a3b8",
  locked: "#334155",
};

export default function CurriculumTree({ chapters }: Props) {
  return (
    <div className="space-y-2">
      {chapters.map((ch, idx) => {
        const status = ch.status ?? "available";
        const Icon = statusIcon[status];
        const color = statusColor[status];
        const isLocked = status === "locked";

        return (
          <div key={ch.id} className="flex gap-4">
            {/* Timeline */}
            <div className="flex flex-col items-center w-8 flex-shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: isLocked ? "rgba(255,255,255,0.03)" : `${color}18`, border: `2px solid ${isLocked ? "rgba(255,255,255,0.06)" : color}` }}>
                <Icon className="w-3.5 h-3.5" style={{ color }} />
              </div>
              {idx < chapters.length - 1 && (
                <div className="w-0.5 flex-1 mt-1"
                  style={{ background: status === "completed" ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.06)", minHeight: "20px" }} />
              )}
            </div>

            {/* Chapter card */}
            <div className={cn(
              "flex-1 mb-2 rounded-xl p-4 transition-all",
              isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-white/6",
              status === "in_progress" ? "border border-purple-500/30 bg-purple-500/5" : "glass"
            )}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-500">Chapter {ch.sequence_order}</span>
                    {status === "in_progress" && (
                      <span className="text-xs px-2 py-0.5 rounded-full text-purple-300"
                        style={{ background: "rgba(124,58,237,0.2)" }}>In Progress</span>
                    )}
                    {status === "completed" && (
                      <span className="text-xs px-2 py-0.5 rounded-full text-emerald-400"
                        style={{ background: "rgba(16,185,129,0.15)" }}>Completed</span>
                    )}
                  </div>
                  <h3 className={cn("font-semibold text-sm", isLocked ? "text-slate-600" : "text-white")}>
                    {ch.title}
                  </h3>
                  {ch.mastery_score !== undefined && (
                    <div className="mt-2 progress-track" style={{ maxWidth: 120 }}>
                      <div className="progress-fill" style={{ width: `${ch.mastery_score}%` }} />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {ch.estimated_duration_mins}m
                  </span>
                  {!isLocked && (
                    <Link href={`/learn/${ch.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: status === "in_progress" ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.06)", color: status === "in_progress" ? "#c4b5fd" : "#94a3b8" }}>
                      {status === "completed" ? "Review" : status === "in_progress" ? "Continue" : "Start"}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
