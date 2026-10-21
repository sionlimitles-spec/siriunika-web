"use client";

import { useEffect, useState } from "react";
import {
  Battery,
  BatteryCharging,
  BatteryLow,
  Globe2,
  Monitor,
  Smartphone,
  Wifi,
  WifiOff,
} from "lucide-react";
import { siteConfig } from "@/config/config";
import { cn } from "@/lib/utils";

type DeviceType = "Android" | "iOS" | "Windows" | "macOS" | "Linux" | "Unknown";
type BrowserType =
  | "Chrome"
  | "Firefox"
  | "Safari"
  | "Edge"
  | "Opera"
  | "Samsung Internet"
  | "Unknown";

interface BatteryManagerLike extends EventTarget {
  level: number;
  charging: boolean;
}
interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManagerLike>;
}

function detectDevice(ua: string): DeviceType {
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/windows/i.test(ua)) return "Windows";
  if (/macintosh|mac os x/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Unknown";
}

function detectBrowser(ua: string): BrowserType {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung Internet";
  if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) return "Safari";
  return "Unknown";
}

const countryNames: Record<string, string> = {
  ID: "Indonesia",
  MY: "Malaysia",
  SG: "Singapore",
  US: "United States",
  JP: "Japan",
  KR: "South Korea",
  GB: "United Kingdom",
  AU: "Australia",
  IN: "India",
  PH: "Philippines",
  TH: "Thailand",
  VN: "Vietnam",
};

function CountryFlag({ code }: { code: string }): React.ReactElement {
  const base = "h-4 w-6 rounded-[2px] ring-1 ring-black/10";
  switch (code) {
    case "ID":
      return (
        <svg viewBox="0 0 24 16" className={base} aria-hidden="true">
          <rect width="24" height="8" fill="#ce1126" />
          <rect y="8" width="24" height="8" fill="#ffffff" />
        </svg>
      );
    case "MY":
      return (
        <svg viewBox="0 0 24 16" className={base} aria-hidden="true">
          <rect width="24" height="16" fill="#cc0001" />
          <g fill="#ffffff">
            <rect y="0" width="24" height="1.14" />
            <rect y="2.28" width="24" height="1.14" />
            <rect y="4.56" width="24" height="1.14" />
            <rect y="6.84" width="24" height="1.14" />
            <rect y="9.12" width="24" height="1.14" />
            <rect y="11.4" width="24" height="1.14" />
            <rect y="13.68" width="24" height="1.14" />
          </g>
          <rect width="12" height="9.12" fill="#010066" />
        </svg>
      );
    case "JP":
      return (
        <svg viewBox="0 0 24 16" className={base} aria-hidden="true">
          <rect width="24" height="16" fill="#ffffff" />
          <circle cx="12" cy="8" r="4.4" fill="#bc002d" />
        </svg>
      );
    case "US":
      return (
        <svg viewBox="0 0 24 16" className={base} aria-hidden="true">
          <rect width="24" height="16" fill="#ffffff" />
          <g fill="#b22234">
            <rect y="0" width="24" height="1.23" />
            <rect y="2.46" width="24" height="1.23" />
            <rect y="4.92" width="24" height="1.23" />
            <rect y="7.38" width="24" height="1.23" />
            <rect y="9.84" width="24" height="1.23" />
            <rect y="12.3" width="24" height="1.23" />
            <rect y="14.76" width="24" height="1.23" />
          </g>
          <rect width="12" height="8.61" fill="#3c3b6e" />
        </svg>
      );
    case "KR":
      return (
        <svg viewBox="0 0 24 16" className={base} aria-hidden="true">
          <rect width="24" height="16" fill="#ffffff" />
          <circle cx="12" cy="8" r="4" fill="#cd2e3a" />
          <path d="M8 8a4 4 0 0 1 8 0h-4z" fill="#0047a0" />
        </svg>
      );
    default:
      return (
        <span className="inline-flex h-4 w-6 items-center justify-center rounded-[2px] bg-surface-border text-[8px] font-bold text-content-muted">
          {code}
        </span>
      );
  }
}

export function UserInfoCard(): React.ReactElement {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceType>("Unknown");
  const [browser, setBrowser] = useState<BrowserType>("Unknown");
  const [online, setOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [charging, setCharging] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setDevice(detectDevice(ua));
    setBrowser(detectBrowser(ua));
    setOnline(navigator.onLine);

    function handleOnline(): void {
      setOnline(true);
    }
    function handleOffline(): void {
      setOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    let cancelled = false;
    async function fetchCountry(): Promise<void> {
      try {
        const res = await fetch("/api/geo", { cache: "no-store" });
        if (!res.ok) return;
        const data: unknown = await res.json();
        if (typeof data === "object" && data !== null && "country" in data) {
          const value = (data as { country: unknown }).country;
          if (typeof value === "string" && !cancelled) {
            setCountryCode(value.toUpperCase());
          }
        }
      } catch {
        // country tetap null
      }
    }
    void fetchCountry();

    const nav = navigator as NavigatorWithBattery;
    let battery: BatteryManagerLike | null = null;
    function updateBattery(): void {
      if (!battery) return;
      setBatteryLevel(Math.round(battery.level * 100));
      setCharging(battery.charging);
    }
    if (typeof nav.getBattery === "function") {
      void nav.getBattery().then((b) => {
        if (cancelled) return;
        battery = b;
        updateBattery();
        b.addEventListener("levelchange", updateBattery);
        b.addEventListener("chargingchange", updateBattery);
      });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (battery) {
        battery.removeEventListener("levelchange", updateBattery);
        battery.removeEventListener("chargingchange", updateBattery);
      }
    };
  }, []);

  const countryLabel = countryCode
    ? countryNames[countryCode] ?? countryCode
    : "Tidak terdeteksi";

  const DeviceIcon =
    device === "Android" || device === "iOS" ? Smartphone : Monitor;

  const BatteryIcon = charging
    ? BatteryCharging
    : (batteryLevel ?? 0) <= 20
      ? BatteryLow
      : Battery;

  return (
    <section aria-label="Informasi pengguna" className="glass p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent ring-1 ring-accent/25"
          aria-hidden="true"
        >
          <span className="font-display text-lg font-bold">N</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-sm font-semibold text-content">
              Nexus User
            </p>
            <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent ring-1 ring-accent/25">
              {siteConfig.userRole}
            </span>
          </div>

          <dl className="mt-3 grid grid-cols-1 gap-2 text-xs text-content-muted sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Globe2 className="h-3.5 w-3.5 shrink-0 text-accent/80" aria-hidden="true" />
              <dt className="sr-only">Negara</dt>
              <dd className="flex min-w-0 items-center gap-1.5">
                {countryCode ? <CountryFlag code={countryCode} /> : null}
                <span className="truncate">{countryLabel}</span>
              </dd>
            </div>

            <div className="flex items-center gap-2">
              <DeviceIcon className="h-3.5 w-3.5 shrink-0 text-accent/80" aria-hidden="true" />
              <dt className="sr-only">Perangkat</dt>
              <dd className="truncate">
                {device} &middot; {browser}
              </dd>
            </div>

            <div className="flex items-center gap-2">
              {online ? (
                <Wifi className="h-3.5 w-3.5 shrink-0 text-green-500" aria-hidden="true" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 shrink-0 text-red-400" aria-hidden="true" />
              )}
              <dt className="sr-only">Status koneksi</dt>
              <dd className={cn(online ? "text-green-500" : "text-red-400")}>
                {online ? "Online" : "Offline"}
              </dd>
            </div>

            {batteryLevel !== null ? (
              <div className="flex items-center gap-2">
                <BatteryIcon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    batteryLevel <= 20 && !charging
                      ? "text-red-400"
                      : "text-accent/80",
                  )}
                  aria-hidden="true"
                />
                <dt className="sr-only">Baterai</dt>
                <dd>
                  {batteryLevel}%{charging ? " · Mengisi" : ""}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </section>
  );
        }
