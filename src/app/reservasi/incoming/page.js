"use client";

import { useEffect, useState } from "react";
import html2canvas from "html2canvas";
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
    await fetchReservations();
  };

  const handleSendWAWithStruk = async (res) => {
    const el = document.getElementById(`struk-${res.id}`);
    const canvas = await html2canvas(el, { scale: 2 });
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    const formData = new FormData();
    formData.append("file", blob, `struk-${res.id}.png`);
    formData.append("tab", "struk");

    const token = await user.getIdToken();

    const uploadRes = await fetch("/api/gallery/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      return alert(uploadData.error || "Gagal upload struk ke S3");
    }

    const pesan = encodeURIComponent(
      `Halo ${res.name}, berikut bukti reservasi Anda:\n\n${uploadData.data.image_url}`
    );
    window.open(`https://wa.me/${res.phone}?text=${pesan}`, "_blank");
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Incoming Reservations
      </h1>

      {reservations.length === 0 ? (
        <p className="text-gray-400 text-center">Tidak ada reservasi baru.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col items-center"
            >
              {/* STRUK */}
              <div
                id={`struk-${res.id}`}
                className="w-[400px] min-h-[520px] bg-[#FAF7F0] border border-[#ffffff] rounded-lg shadow-md overflow-hidden font-serif flex flex-col text-black"
              >
                {/* HEADER */}
                <div className="bg-[#1A1A1A] p-6 flex flex-col items-center justify-center">
                  <img
                    src="/image/LOGO_JENDRAL.png"
                    alt="Logo Jendral"
                    className="h-20 object-contain mb-2 brightness-200 contrast-200"
                  />
                  <h2 className="text-white text-lg font-bold tracking-widest">
                    Reservation Card
                  </h2>
                </div>

                {/* ISI */}
                <div className="p-6 flex-1 text-[#1A1A1A] text-sm space-y-3">
                  <p>
                    <strong>Nama:</strong> {res.name?.toUpperCase()}
                  </p>
                  <p>
                    <strong>Tanggal:</strong> {res.date}
                  </p>
                  <p>
                    <strong>Jam:</strong> {res.time}
                  </p>
                  <p>
                    <strong>Jumlah Orang:</strong> {res.people}
                  </p>
                  <p>
                    <strong>Ruangan:</strong> {res.room}
                  </p>
                  <p>
                    <strong>Telepon:</strong>{" "}
                    {res.phone?.startsWith("0")
                      ? "62" + res.phone.slice(1)
                      : res.phone}
                  </p>

                  {Array.isArray(res.order) && res.order.length > 0 && (
                    <>
                      <p>
                        <strong>Pesanan Menu:</strong>
                      </p>
                      <ul className="list-disc ml-6">
                        {res.order.map((item, index) => (
                          <li key={index}>
                            {item.name} - {item.qty}x @Rp
                            {item.price?.toLocaleString()} ={" "}
                            <strong>Rp{item.total?.toLocaleString()}</strong>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2">
                        <strong>Total Harga:</strong> Rp
                        {res.order
                          .reduce((sum, item) => sum + (item.total || 0), 0)
                          .toLocaleString()}
                      </p>
                    </>
                  )}
                </div>

                {/* FOOTER */}
                <div className="text-xs italic text-center text-[#555] p-3 border-t border-[#D6CFC1]">
                  Terima kasih telah melakukan reservasi di{" "}
                  <strong>Jendral Le Veteran</strong>.
                </div>
              </div>

              {/* TOMBOL AKSI */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <button
                  onClick={() => handleApprove(res.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleSendWAWithStruk(res)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                >
                  Kirim WA + Struk
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
