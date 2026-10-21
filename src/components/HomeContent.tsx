"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link"; // <-- PASTIKAN INI ADA
import { ArrowUpRight, Clock3, Search, Star } from "lucide-react";
import { categories, tools, type Tool } from "@/config/config";
import { cn } from "@/lib/utils";

// ... (kode readSlugs tetap sama) ...

function ToolCard({ tool, index }: { tool: Tool; index: number }): React.ReactElement {
  const Icon = tool.icon;
  const categoryName = categories.find((c) => c.id === tool.category)?.name ?? tool.category;

  return (
    <Link
      href={tool.href} // <-- PASTIKAN INI MENGARAH KE /tools/anime
      className="group glass glass-hover relative flex flex-col overflow-hidden p-4 animate-fade-up sm:p-5"
      style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
    >
      {/* ... isi kartu ... */}
    </Link>
  );
}
