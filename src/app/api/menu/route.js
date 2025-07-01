import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

// GET: Ambil semua menu
export async function GET() {
  const snapshot = await getDocs(collection(db, "menus"));
  const menus = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return Response.json(menus);
}

// POST: Tambah menu baru
export async function POST(req) {
  const body = await req.json();
  const docRef = await addDoc(collection(db, "menus"), {
    name: body.name,
    price: Number(body.price),
    category: body.category,
  });
  return Response.json({ id: docRef.id });
}