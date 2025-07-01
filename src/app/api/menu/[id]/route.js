import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";

// GET: Detail menu (opsional)
export async function GET(req, { params }) {
  const ref = doc(db, "menus", params.id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ id: snap.id, ...snap.data() });
}

// PUT: Update menu
export async function PUT(req, { params }) {
  const body = await req.json();
  const ref = doc(db, "menus", params.id);
  await updateDoc(ref, {
    name: body.name,
    price: Number(body.price),
    category: body.category,
  });
  return Response.json({ success: true });
}

// DELETE: Hapus menu
export async function DELETE(req, { params }) {
  const ref = doc(db, "menus", params.id);
  await deleteDoc(ref);
  return Response.json({ success: true });
}