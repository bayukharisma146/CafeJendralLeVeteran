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
      "Drink"
    ];
    const CATEGORY_ORDER = [
      "Brunch",
      "Snack",
      "Soup",
      "Oyster",
      "Pasta",
      "Pizza",
      "Main Course",
      "Rice",
      "Dessert",
      "Drink"
    ];

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

    // Ambil data menu dari database
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
        // Simpan hanya angka, tampilkan format rupiah
        setForm({ ...form, price: value.replace(/[^0-9]/g, "") });
        } else {
        setForm({ ...form, [name]: value });
        }
    };

    // Tambah atau update menu
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price || !form.category) return;

        setLoading(true);
        if (editId) {
        await fetch(`/api/menu/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, price: Number(form.price) }),
        });
        } else {
        await fetch("/api/menu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, price: Number(form.price) }),
        });
        }
        setForm({ name: "", price: "", category: "" });
        setEditId(null);
        fetchMenus();
    };

    const handleEdit = (menu) => {
        setForm({ name: menu.name, price: String(menu.price), category: menu.category });
        setEditId(menu.id);
    };

    const handleDelete = async (id) => {
        if (confirm("Hapus menu ini?")) {
        setLoading(true);
        await fetch(`/api/menu/${id}`, { method: "DELETE" });
        fetchMenus();
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl font-bold mb-6">Kelola Menu</h1>
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-2">
            <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nama Menu"
            className="px-3 py-2 rounded text-black"
            />
            <input
            name="price"
            value={form.price ? formatRupiah(form.price) : ""}
            onChange={handleChange}
            placeholder="Harga"
            className="px-3 py-2 rounded text-black"
            inputMode="numeric"
            autoComplete="off"
            />
            <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="px-3 py-2 rounded text-black"
            >
            <option value="">Pilih Kategori</option>
            {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
            ))}
            </select>
            <button
            type="submit"
            className="bg-green-500 px-4 py-2 rounded text-white font-semibold"
            disabled={loading}
            >
            {editId ? "Update" : "Tambah"}
            </button>
            {editId && (
            <button
                type="button"
                onClick={() => {
                setForm({ name: "", price: "", category: "" });
                setEditId(null);
                }}
                className="bg-gray-500 px-4 py-2 rounded text-white font-semibold"
            >
                Batal
            </button>
            )}
        </form>
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
      // Jika kategori tidak ditemukan, letakkan di akhir
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    })
    .map((menu) => (
      <tr key={menu.id} className="border-t">
        <td className="p-2">{menu.name}</td>
        <td className="p-2">Rp{Number(menu.price).toLocaleString("id-ID")}</td>
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
        </div>
    );
    }