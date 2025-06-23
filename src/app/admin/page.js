"use client";

import { useEffect, useState } from "react";
import { auth, onAuthStateChanged, signOut } from "@/lib/firebase";
import Link from "next/link";
import {
  Moon,
  User2,
  Image, // Ikon untuk galeri
  Clock9, // Ikon untuk incoming reservasi
  CheckCircle, // Ikon untuk approved reservasi
} from "lucide-react";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogin = () => {
    import("firebase/auth").then(({ GoogleAuthProvider, signInWithPopup }) => {
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider).catch((error) => alert(error.message));
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser?.email === "jendralleveteran@gmail.com") {
        setUser(currentUser);
      } else {
        alert("Unauthorized access!");
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Loading admin panel...
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="h-screen w-full bg-cover bg-center flex flex-col justify-center items-center text-white"
        style={{ backgroundImage: "url('/image/other/Gedung.jpg')" }}
      >
        <div className="bg-black bg-opacity-60 p-8 rounded-xl text-center max-w-md w-full">
          <img
            src="/image/other/logo.jpg"
            alt="Logo"
            className="mx-auto mb-4 w-16 h-16 rounded-full"
          />
          <h1 className="text-2xl font-bold mb-2">Login As Admin</h1>
          <p className="mb-6">Continue with Google to access admin mode</p>
          <button
            onClick={handleLogin}
            className="bg-white text-black px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <main className="p-8 overflow-y-auto min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AdminCard
            title="Kelola Galeri"
            href="/gallery"
            icon={<Image size={40} className="text-blue-400" />}
          />
          <AdminCard
            title="Incoming Reservasi"
            href="/reservasi/incoming"
            icon={<Clock9 size={40} className="text-yellow-400" />}
          />
          <AdminCard
            title="Approve Reservasi"
            href="/reservasi/approved"
            icon={<CheckCircle size={40} className="text-green-400" />}
          />
        </div>
      </main>
    </div>
  );
}

function AdminCard({ title, href, icon }) {
  return (
    <Link href={href}>
      <div className="bg-white text-black p-6 rounded-xl shadow hover:shadow-md transition flex flex-col items-center justify-center gap-4">
        {icon}
        <h3 className="text-lg font-semibold text-center">{title}</h3>
      </div>
    </Link>
  );
}
