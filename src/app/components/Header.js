"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const isMenuPage = pathname.startsWith("/menu");

  // Class untuk link:
  // - Default: no background
  // - Hover & focus & active: muncul bg gradient + shadow + timbul
  const linkClass = `
    px-3 py-1 rounded-md transition-all duration-200
    hover:bg-gradient-to-b hover:from-white/10 hover:to-white/5
    hover:shadow-lg hover:-translate-y-1
    focus-visible:bg-gradient-to-b focus-visible:from-white/10 focus-visible:to-white/5
    focus-visible:shadow-lg focus-visible:-translate-y-1
    active:bg-gradient-to-b active:from-white/10 active:to-white/5
    active:shadow-lg active:-translate-y-1
  `;

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full px-4">
      <nav className="flex items-center justify-center gap-6 bg-black/80 text-white px-6 py-3 rounded-2xl shadow-lg backdrop-blur-md overflow-x-auto no-scrollbar w-full max-w-6xl mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg tracking-widest font-semibold shrink-0"
        >
          <span className="font-serif">JENDERAL</span>
        </Link>

        {/* Menu Items */}
        <div className="flex gap-3 text-sm flex-nowrap overflow-x-auto no-scrollbar">
          {isMenuPage ? (
            <>
              <Link href="/" className={linkClass}>
                HOME
              </Link>
              <Link href="/menu/brunch" className={linkClass}>
                BRUNCH
              </Link>
              <Link href="/menu/snack" className={linkClass}>
                SNACK
              </Link>
              <Link href="/menu/soup" className={linkClass}>
                SOUP
              </Link>
              <Link href="/menu/oyster" className={linkClass}>
                OYSTER
              </Link>
              <Link href="/menu/pasta" className={linkClass}>
                PASTA
              </Link>
              <Link href="/menu/pizza" className={linkClass}>
                PIZZA
              </Link>
              <Link href="/menu/main-course" className={linkClass}>
                MAIN COURSE
              </Link>
              <Link href="/menu/rice" className={linkClass}>
                RICE
              </Link>
              <Link href="/menu/dessert" className={linkClass}>
                DESSERT
              </Link>
              <Link href="/menu/drink" className={linkClass}>
                DRINK
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className={linkClass}>
                HOME
              </Link>
              <Link href="/menu" className={linkClass}>
                MENU
              </Link>
              <Link href="/venue" className={linkClass}>
                VENUE
              </Link>
              <Link href="/reservasi" className={linkClass}>
                RESERVASI
              </Link>
              <Link href="/gallery" className={linkClass}>
                GALLERY
              </Link>
              <Link href="/contact" className={linkClass}>
                CONTACT
              </Link>
              <Link href="/admin" className={linkClass}>
                ADMIN
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
