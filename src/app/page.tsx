"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { UserInfoCard } from "@/components/UserInfoCard";
import { HomeContent } from "@/components/HomeContent";
import { siteConfig } from "@/config/config";
import { formatDateId, formatTimeId, getGreeting } from "@/lib/utils";

function GreetingBlock(): React.ReactElement {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!now) {
    return (
      <div className="space-y-2" aria-hidden="true">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-surface-elevated" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-surface-elevated" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-content sm:text-3xl">
        {getGreeting(now)}, <span className="text-accent-glow">Nexus</span>
      </h1>
      <p className="mt-1 text-sm text-content-muted sm:text-base">
        {formatDateId(now)} &middot; {formatTimeId(now)}
      </p>
    </div>
  );
}

function HeroBlock(): React.ReactElement {
  return (
    <section
      aria-label="Banner utama"
      className="relative overflow-hidden rounded-3xl border border-surface-border"
    >
      <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
        <Image
          src={siteConfig.heroImage}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            All Tools Nexus
          </p>
          <h2 className="mt-2 max-w-2xl font-display text-xl font-bold leading-tight text-white sm:text-2xl lg:text-3xl">
            {siteConfig.heroTitle}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/75 sm:text-base">
            {siteConfig.heroSubtitle}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function HomePage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <GreetingBlock />
        <UserInfoCard />
      </section>
      <HeroBlock />
      <HomeContent />
    </div>
  );
}
