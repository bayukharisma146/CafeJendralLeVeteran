"use client";

import { useEffect, useState } from "react";
import { auth, onAuthStateChanged, signOut } from "@/lib/firebase";
import Link from "next/link";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser?.email === "jendralleveteran@gmail.com") {
        setUser(currentUser);
      } else {
        alert("Unauthorized access!");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading admin panel...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-6">
        <h2 className="mb-4 text-2xl font-bold">Login as Admin</h2>
        <button
          onClick={() => {
            import("firebase/auth").then(
              ({ GoogleAuthProvider, signInWithPopup }) => {
                const provider = new GoogleAuthProvider();
                signInWithPopup(auth, provider).catch((error) =>
                  alert(error.message)
                );
              }
            );
          }}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Login with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Menu Admin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <AdminCard title="Kelola Galeri" href="/gallery" />
        <AdminCard title="Reservasi Incoming" href="/reservasi/incoming" />
        <AdminCard title="Reservasi Approved" href="/reservasi/approved" />
      </div>
    </div>
  );
}

function AdminCard({ title, href }) {
  return (
    <Link href={href}>
      <div className="bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-700 transition duration-300 cursor-pointer">
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
    </Link>
  );
}
