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
} from "firebase/firestore";

// Ambil semua reservasi dengan status "incoming"
export async function getIncomingReservations() {
  const q = query(
    collection(db, "reservations"),
    where("status", "==", "incoming"),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Ambil semua reservasi dengan status "approved"
export async function getApprovedReservations() {
  const q = query(
    collection(db, "reservations"),
    where("status", "==", "approved"),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Update status reservasi (misalnya dari "incoming" ke "approved")
export async function updateReservationStatus(id, status) {
  const ref = doc(db, "reservations", id);
  await updateDoc(ref, { status });
}

// Simpan reservasi baru ke Firestore
export async function saveReservation(data) {
  const ref = collection(db, "reservations");
  await addDoc(ref, {
    name: data.name,
    phone: data.phone,
    people: Number(data.people),
    room: data.room,
    date: data.date, // yyyy-mm-dd
    time: `${data.time} ${data.ampm}`,
    status: "incoming",
    created_at: "", // jika ingin pakai timestamp: new Date().toISOString()
    user_email: data.user_email,
  });
}
