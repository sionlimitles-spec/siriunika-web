import Link from "next/link";

export default function AnimeTestPage() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-accent mb-4">TOMBOL BERFUNGSI!</h1>
      <p className="text-white mb-8">Jika kamu melihat halaman ini, berarti navigasi Next.js kamu sukses.</p>
      <Link href="/" className="px-4 py-2 bg-red-600 text-white rounded-lg">
        Kembali ke Home
      </Link>
    </div>
  );
}
