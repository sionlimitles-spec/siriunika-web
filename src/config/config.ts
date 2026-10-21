// ===== Playlist =====
export interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  src: string;
}

/**
 * Playlist global MusicPlayer.
 * Sumber royalty-free yang direkomendasikan:
 *   - https://soundhelix.com  (contoh di bawah, CC/royalty-free)
 *   - https://jamendo.com      (filter CC-BY)
 *   - https://freemusicarchive.org
 *   - https://incompetech.com  (Kevin MacLeod)
 *
 * Untuk file lokal, letakkan di /public/music/ dan pakai src "/music/nama.mp3".
 * Cover: letakkan di /public/images/ atau pakai URL publik.
 *
 * Tambahkan track baru = tambah entry di array ini. MusicPlayer otomatis
 * mendeteksi dan menyimpannya di localStorage.
 */
export const playlist: Track[] = [
  {
    id: "soundhelix-song-1",
    title: "SoundHelix Song 1",
    artist: "T. Schürger",
    cover: "/images/cover-default.svg",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "soundhelix-song-2",
    title: "SoundHelix Song 2",
    artist: "T. Schürger",
    cover: "/images/cover-default.svg",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "soundhelix-song-3",
    title: "SoundHelix Song 3",
    artist: "T. Schürger",
    cover: "/images/cover-default.svg",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];
