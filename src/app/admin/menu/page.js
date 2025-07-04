"use client";

import { useEffect, useState } from "react";

const CATEGORIES = [
  "Brunch",
  "Snack",
  "Soup",
  "Oyster",
  "Pasta",
  "Pizza",
  "Main Course",
  "Rice",
  "Dessert",
  "Drink",
];
const CATEGORY_ORDER = [...CATEGORIES];

function formatRupiah(value) {
  if (!value) return "";
  const number = value.toString().replace(/[^0-9]/g, "");
  return "Rp " + Number(number).toLocaleString("id-ID");
}

export default function KelolaMenuPage() {
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", category: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchMenus = async () => {
    setLoading(true);
    const res = await fetch("/api/menu");
    const data = await res.json();
    setMenus(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "price") {
      setForm({ ...form, price: value.replace(/[^0-9]/g, "") });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) return;

    setLoading(true);
    try {
      if (editId) {
        await fetch(`/api/menu/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, price: Number(form.price) }),
        });
        alert("Menu berhasil diperbarui!");
      } else {
        await fetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, price: Number(form.price) }),
        });
        alert("Menu berhasil ditambahkan!");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan data.");
    }

    setForm({ name: "", price: "", category: "" });
    setEditId(null);
    setShowModal(false);
    fetchMenus();
  };

  const handleEdit = (menu) => {
    setForm({
      name: menu.name,
      price: String(menu.price),
      category: menu.category,
    });
    setEditId(menu.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus menu ini?")) {
      // Optimistically remove the menu from UI
      setMenus((prev) => prev.filter((menu) => menu.id !== id));

      // Hapus dari database
      await fetch(`/api/menu/${id}`, { method: "DELETE" });
    }
  };
  

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Kelola Menu</h1>

      {/* Form Tambah Menu */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-col md:flex-row gap-2 flex-wrap"
      >
        <input
          name="name"
          value={editId ? "" : form.name}
          onChange={handleChange}
          placeholder="Nama Menu"
          className="px-3 py-2 rounded text-black"
          disabled={editId}
        />
        <input
          name="price"
          value={editId ? "" : form.price ? formatRupiah(form.price) : ""}
          onChange={handleChange}
          placeholder="Harga"
          className="px-3 py-2 rounded text-black"
          inputMode="numeric"
          autoComplete="off"
          disabled={editId}
        />
        <select
          name="category"
          value={editId ? "" : form.category}
          onChange={handleChange}
          className="px-3 py-2 rounded text-black"
          disabled={editId}
        >
          <option value="">Pilih Kategori</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-green-500 px-4 py-2 rounded text-white font-semibold"
          disabled={loading || editId}
        >
          Tambah
        </button>
      </form>

      {/* Table Menu */}
      <table className="w-full bg-white text-black rounded">
        <thead>
          <tr>
            <th className="p-2">Nama</th>
            <th className="p-2">Harga</th>
            <th className="p-2">Kategori</th>
            <th className="p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {menus
            .slice()
            .sort((a, b) => {
              const idxA = CATEGORY_ORDER.indexOf(a.category);
              const idxB = CATEGORY_ORDER.indexOf(b.category);
              return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
            })
            .map((menu) => (
              <tr key={menu.id} className="border-t">
                <td className="p-2">{menu.name}</td>
                <td className="p-2">
                  Rp{Number(menu.price).toLocaleString("id-ID")}
                </td>
                <td className="p-2">{menu.category}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(menu)}
                    className="bg-yellow-400 px-2 py-1 rounded text-black"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(menu.id)}
                    className="bg-red-500 px-2 py-1 rounded text-white"
                    disabled={loading}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          {menus.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center p-4 text-gray-500">
                {loading ? "Memuat data..." : "Belum ada menu"}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-6 w-[90%] max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Menu</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nama Menu"
                className="px-3 py-2 rounded border"
              />
              <input
                name="price"
                value={form.price ? formatRupiah(form.price) : ""}
                onChange={handleChange}
                placeholder="Harga"
                className="px-3 py-2 rounded border"
                inputMode="numeric"
              />
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="px-3 py-2 rounded border"
              >
                <option value="">Pilih Kategori</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditId(null);
                    setForm({ name: "", price: "", category: "" });
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={loading}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
