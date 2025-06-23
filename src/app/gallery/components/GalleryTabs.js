"use client";

import { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import { Plus } from "lucide-react";

export default function GalleryTabs({ activeTab, setActiveTab, isAdmin }) {
  const [galleryData, setGalleryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [tabInput, setTabInput] = useState("food");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();

  const getIdToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      setGalleryData(data);
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const openAddMenu = () => {
    setFabOpen(false);
    setShowAddMenu(true);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmitMenu = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Pilih gambar terlebih dahulu!");
    const token = await getIdToken();
    if (!token) return alert("You must be logged in!");

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("tab", tabInput);

    try {
      const uploadRes = await fetch("/api/gallery/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) return alert(uploadData.error || "Upload gagal");

      setGalleryData((prev) => ({
        ...prev,
        [tabInput]: [
          ...(prev[tabInput] || []),
          { id: uploadData.data.id, image_url: uploadData.data.image_url },
        ],
      }));

      setShowAddMenu(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Terjadi kesalahan saat upload");
    }
  };

  const handleDeleteImage = async (id) => {
    const token = await getIdToken();
    if (!token) return alert("You must be logged in!");
    const res = await fetch("/api/gallery", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      fetchGallery();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to delete image");
    }
  };

  const imagesToShow = galleryData[activeTab] || [];

  return (
    <>
      {showAddMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[999]">
          <div className="flex items-center justify-center py-10 px-4">
            <form
              onSubmit={handleSubmitMenu}
              className="w-full max-w-lg p-8 bg-[#181818] rounded-2xl border border-gray-700 shadow-xl flex flex-col gap-6 relative"
            >
              <button
                type="button"
                onClick={() => setShowAddMenu(false)}
                className="absolute top-4 right-6 text-white text-3xl font-bold z-50"
              >
                &times;
              </button>
              <h2 className="text-3xl text-center font-serif text-[#E5D4B6]">
                Upload Menu
              </h2>

              <div className="flex flex-col items-center p-4 bg-[#212121] rounded-xl border border-gray-700">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-xs h-40 object-cover rounded mb-4"
                  />
                ) : (
                  <div className="h-40 w-full flex items-center justify-center text-gray-500">
                    Preview Gambar
                  </div>
                )}
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <span className="inline-block bg-gray-700 text-[#E5D4B6] px-6 py-2 rounded-lg cursor-pointer">
                    {imagePreview ? "Ubah Gambar" : "Pilih Gambar"}
                  </span>
                </label>
              </div>

              <select
                value={tabInput}
                onChange={(e) => setTabInput(e.target.value)}
                className="bg-gray-700 text-[#E5D4B6] px-4 py-2 rounded-lg"
              >
                <option value="food">Food</option>
                <option value="people">People</option>
                <option value="other">Other</option>
              </select>

              <button
                type="submit"
                className="w-full bg-[#E5D4B6] text-black font-semibold py-2 rounded-md hover:opacity-90"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Gallery */}
      <div className={showAddMenu ? "pointer-events-none blur-sm" : ""}>
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-6">
          {["food", "people", "other"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setDeleteMode(false);
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold uppercase transition ${
                activeTab === tab
                  ? "bg-black text-white"
                  : "bg-white text-black border border-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid / Loader */}
        {loading ? (
          <div className="text-center text-white">Memuat galeri...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {imagesToShow.map(({ id, image_url }) => (
              <div
                key={id}
                className="relative w-full aspect-[3/2] overflow-hidden rounded-xl shadow-lg bg-[#191919]"
              >
                <img
                  src={image_url}
                  alt={activeTab}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {isAdmin && deleteMode && (
                  <button
                    onClick={() => handleDeleteImage(id)}
                    className="absolute top-2 right-2 bg-red-700 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold text-xl"
                  >
                    &minus;
                  </button>
                )}
                {!deleteMode && (
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => setPreviewImage(image_url)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      {isAdmin && (
        <>
          {fabOpen && (
            <button
              onClick={() => setFabOpen((v) => !v)}
              className="w-16 h-16 rounded-full bg-white text-yellow-500 text-4xl font-bold flex items-center justify-center shadow-lg border border-gray-300"
            >
              +
            </button>
          )}
          <div className="fixed bottom-24 right-8 z-50 flex flex-col items-end gap-2">
            <div
              className={`transition-all duration-300 flex flex-col gap-2 ${
                fabOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12 pointer-events-none"
              }`}
            >
              <button
                onClick={openAddMenu}
                className="bg-black text-white px-5 py-2 rounded-full shadow hover:bg-gray-800"
              >
                + Tambah Gambar
              </button>
              <button
                onClick={() => {
                  setDeleteMode((v) => !v);
                  setFabOpen(false);
                }}
                className={`px-5 py-2 rounded-full shadow text-white ${
                  deleteMode ? "bg-gray-600" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                − Hapus Gambar
              </button>
            </div>
            <button
              onClick={() => setFabOpen((v) => !v)}
              className="w-16 h-16 rounded-full bg-white text-4xl flex items-center justify-center shadow-lg border"
            >
              +
            </button>
          </div>
        </>
      )}

      {/* Modal Preview */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative max-w-3xl w-full px-4">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 text-white text-3xl font-bold"
            >
              &times;
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
