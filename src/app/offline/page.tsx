import type { Metadata } from "next";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Offline",
  description: "Halaman offline.",
};

export default function OfflinePage(): React.ReactElement {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="glass max-w-sm p-8 text-center">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 text-accent ring-1 ring-accent/25"
          aria-hidden="true"
        >
          <WifiOff className="h-8 w-8" />
        </div>
        <h1 className="mt-4 font-display text-xl font-bold text-content">
          Anda sedang offline
        </h1>
        <p className="mt-2 text-sm text-content-muted">
          Sambungkan kembali perangkat ke internet, lalu muat ulang halaman.
        </p>
      </div>
    </div>
  );
}
