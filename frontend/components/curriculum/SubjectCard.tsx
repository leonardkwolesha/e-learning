"use client";
import Link from "next/link";
import {
  Code2, Globe, Database, Network, Monitor, Shield, Brain, Cpu,
  BookOpen, Zap, Server, BarChart2, Terminal, Cloud, Layers,
  HardDrive, GitBranch, Smartphone, Lock, Wifi, type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Code2, Globe, Database, Network, Monitor, Shield, Brain, Cpu,
  BookOpen, Zap, Server, BarChart2, Terminal, Cloud, Layers,
  HardDrive, GitBranch, Smartphone, Lock, Wifi,
};

interface Props {
  id: string;
  name: string;
  iconName: string;
  color: string;
  progress: number;
  chapters: number;
  completedChapters: number;
}

export default function SubjectCard({ id, name, iconName, color, progress, chapters, completedChapters }: Props) {
  const Icon: LucideIcon = ICON_MAP[iconName] ?? Code2;
  return (
    <Link href={`/curriculum/${id}`}
      className="relative group flex-shrink-0 w-48 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      style={{ height: 200 }}>

      <div className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(135deg, ${color}40 0%, ${color}15 100%)` }} />
      <div className="absolute inset-0 border border-white/8 rounded-2xl group-hover:border-white/16 transition-colors" />
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20" style={{ background: color }} />

      <div className="relative z-10 p-5 flex flex-col h-full">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-auto shrink-0"
          style={{ background: `${color}25` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>

        <div>
          <h3 className="font-bold text-white text-sm leading-tight mb-3">{name}</h3>
          <div className="progress-track mb-1">
            <div className="progress-fill" style={{ width: `${progress}%`, background: color }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{completedChapters}/{chapters} ch.</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
