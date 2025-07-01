"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const CATEGORY_ORDER = [
  "Brunch",
  "Snack",
  "Soup",
  "Oyster",
  "Pasta",
  "Pizza",
  "Maincourse",
  "Aromatic Rice",
  "Fried Rice",
  "Dessert",
  "Coffee Mocktail",
  "Coffee & Tea",
  "Tea",
  "Non-Coffee",
  "Frappe",
  "Mocktail",
  "Fresh Juice",
  "Softdrink",
];

export default function MenuOrderPage() {
  const [menuData, setMenuData] = useState([]);
  const [order, setOrder] = useState({});
  const [orderLoaded, setOrderLoaded] = useState(false);

  // Ambil menu dari Firestore & order dari localStorage
  useEffect(() => {
    const fetchMenu = async () => {
      const querySnapshot = await getDocs(collection(db, "menus"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuData(data);
    };

    fetchMenu();

    const savedOrder = localStorage.getItem("order");
    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
      console.log("📦 Order dimuat dari localStorage:", savedOrder);
    }
    setOrderLoaded(true);
  }, []);

  // Simpan ke localStorage setiap kali order berubah (setelah loaded)
  useEffect(() => {
    if (orderLoaded) {
      localStorage.setItem("order", JSON.stringify(order));
    }
  }, [order, orderLoaded]);

  const groupByCategory = (data) =>
    data.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

  const addItem = (name, price) => {
    setOrder((prev) => ({
      ...prev,
      [name]: {
        qty: (prev[name]?.qty || 0) + 1,
        price,
      },
    }));
  };

  const removeItem = (name) => {
    setOrder((prev) => {
      const newQty = (prev[name]?.qty || 0) - 1;
      if (newQty <= 0) {
        const newOrder = { ...prev };
        delete newOrder[name];
        return newOrder;
      }
      return {
        ...prev,
        [name]: {
          ...prev[name],
          qty: newQty,
        },
      };
    });
  };

  const total = Object.values(order).reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  const groupedMenu = groupByCategory(menuData);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Pesan Menu</h1>

      {CATEGORY_ORDER.filter((cat) => groupedMenu[cat]).map((category) => {
        const items = groupedMenu[category];
        return (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold mb-3 border-b border-gray-700 pb-1 text-yellow-400">
              {category}
            </h2>
            {items.map(({ id, name, price }) => (
              <div
                key={id}
                className="flex justify-between items-center border-b border-gray-800 py-2"
              >
                <div className="flex-1">
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-gray-400">
                    Rp {price.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeItem(name)}
                    className="bg-gray-700 px-3 py-1 rounded-md"
                  >
                    -
                  </button>
                  <span>{order[name]?.qty || 0}</span>
                  <button
                    onClick={() => addItem(name, price)}
                    className="bg-yellow-400 text-black px-3 py-1 rounded-md"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <div className="border-t border-gray-700 pt-4 mt-6 text-right text-lg font-bold">
        Total: Rp {total.toLocaleString("id-ID")}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          onClick={() => {
            // Simpan order ke localStorage
            localStorage.setItem("order", JSON.stringify(order));

            // Update reservationFinal dengan order terbaru
            const reservation = JSON.parse(
              localStorage.getItem("reservationFinal") || "{}"
            );
            const orderArray = Object.entries(order).map(
              ([name, { qty, price }]) => ({
                name,
                qty,
                price,
                total: qty * price,
              })
            );
            reservation.order = orderArray;
            localStorage.setItem("reservationFinal", JSON.stringify(reservation));

            window.location.href = "/reservasi";
          }}
          className="bg-yellow-400 text-black px-6 py-3 rounded-md text-lg font-semibold shadow-md hover:bg-yellow-300 transition w-full max-w-xs"
        >
          Save
        </button>
      </div>
    </div>
  );
}
