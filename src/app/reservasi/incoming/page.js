"use client";

import { useEffect, useState } from "react";
import { auth, onAuthStateChanged } from "@/lib/firebase";
import {
  getIncomingReservations,
  updateReservationStatus,
} from "@/lib/reservasi";

export default function IncomingReservationPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser?.email === "jendralleveteran@gmail.com") {
        setUser(currentUser);
        await fetchReservations();
      } else {
        alert("Unauthorized");
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const fetchReservations = async () => {
    const data = await getIncomingReservations();
    setReservations(data);
  };

  const handleApprove = async (id) => {
    await updateReservationStatus(id, "approved");
    await fetchReservations(); // refresh list
  };

  if (loading)
    return <p className="text-white p-6">Loading incoming reservations...</p>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Incoming Reservations</h1>
      {reservations.length === 0 ? (
        <p className="text-gray-400">Tidak ada reservasi baru.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {reservations.map((res) => (
            <div key={res.id} className="bg-gray-800 p-4 rounded-lg shadow">
              <p>
                <strong>Nama:</strong> {res.name}
              </p>
              <p>
                <strong>Telepon:</strong> {res.phone}
              </p>
              <p>
                <strong>Tanggal:</strong> {res.date}
              </p>
              <p>
                <strong>Jam:</strong> {res.time} {res.ampm}
              </p>
              <p>
                <strong>Orang:</strong> {res.people}
              </p>
              <p>
                <strong>Ruangan:</strong> {res.room}
              </p>
              <button
                onClick={() => handleApprove(res.id)}
                className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
