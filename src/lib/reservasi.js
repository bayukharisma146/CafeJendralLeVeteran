import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

// ✅ Simpan reservasi baru
export async function saveReservation(data) {
  return await addDoc(collection(db, "reservations"), {
    name: data.name,
    phone: data.phone,
    people: Number(data.people),
    room: data.room,
    date: data.date, // format: YYYY-MM-DD
    startTime: data.startTime, // format: HH:mm
    endTime: data.endTime,
    time: data.time, // contoh: "09:00 - 11:00"
    order: data.order || null, // ← tambahkan order jika ada
    user_email: data.user_email || null,
    status: "incoming", // default status
    created_at: new Date().toISOString(),
  });
}

// ✅ Ambil semua reservasi "incoming" (limit 20)
export async function getIncomingReservations() {
  const q = query(
    collection(db, "reservations"),
    where("status", "==", "incoming"),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ✅ Ambil semua reservasi "approved" (limit 20)
export async function getApprovedReservations() {
  const q = query(
    collection(db, "reservations"),
    where("status", "==", "approved"),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ✅ Update status (approve/reject/done)
export async function updateReservationStatus(id, status) {
  const ref = doc(db, "reservations", id);
  await updateDoc(ref, { status });
}

// ✅ Hapus reservasi berdasarkan ID
export async function deleteReservation(id) {
  const ref = doc(db, "reservations", id);
  await deleteDoc(ref);
}

// ✅ Hitung total orang yang reservasi di slot waktu + ruangan yang sama
export async function getReservationCount(date, startTime, endTime, room) {
  const q = query(
    collection(db, "reservations"),
    where("date", "==", date),
    where("room", "==", room)
  );

  const snapshot = await getDocs(q);
  let total = 0;

  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const targetStart = toMinutes(startTime);
  const targetEnd = toMinutes(endTime);

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!data.startTime || !data.endTime) return;

    const existingStart = toMinutes(data.startTime);
    const existingEnd = toMinutes(data.endTime);

    const isOverlap = targetStart < existingEnd && existingStart < targetEnd;
    if (isOverlap) {
      total += Number(data.people || 0);
    }
  });

  return total;
}
