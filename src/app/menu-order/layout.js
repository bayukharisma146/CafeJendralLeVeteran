export const metadata = {
  title: "Pesan Menu",
  description: "Halaman pemesanan menu restoran",
};

// ✅ Tidak pakai <html> atau <body>, cukup div
export default function MenuOrderLayout({ children }) {
  return <div className="bg-black text-white min-h-screen">{children}</div>;
}
