"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  auth,
  provider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "../../lib/firebase";
import { saveReservation, getReservationCount } from "../../lib/reservasi";
import { useRouter } from "next/navigation";

export default function Reservasipage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [people, setPeople] = useState("");
  const [room, setRoom] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [date, setDate] = useState(null);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFoodPrompt, setShowFoodPrompt] = useState(false);
  const [hasPromptedFood, setHasPromptedFood] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasOrder, setHasOrder] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);
  const router = useRouter();

  const roomCapacity = {
    "vintage-room": 40,
    "indoor-smoking": 25,
    "forest-smoking": 18,
    "outdoor-space": 30,
  };

  useEffect(() => {
    setIsClient(true);
    const order = localStorage.getItem("order");
    if (order) {
      const total = Object.values(JSON.parse(order)).reduce(
        (sum, item) => sum + (item.qty || 0),
        0
      );
      setOrderCount(total);
      setHasOrder(true);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      if (usr) setShowAuthModal(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("reservationData");
    if (saved) {
      const data = JSON.parse(saved);
      setName(data.name || "");
      setPhone(data.phone || "");
      setPeople(data.people || "");
      setRoom(data.room || "");
      setStartTime(data.startTime || "");
      setEndTime(data.endTime || "");
      setDate(data.date ? new Date(data.date) : null);
    }

    const order = localStorage.getItem("order");
    if (order) setHasOrder(true);
  }, []);

  useEffect(() => {
    const reservationData = {
      name,
      phone,
      people,
      room,
      startTime,
      endTime,
      date: date ? date.toISOString() : null,
    };
    localStorage.setItem("reservationData", JSON.stringify(reservationData));
  }, [name, phone, people, room, startTime, endTime, date]);

  const getMaxTimeByDay = () => {
    if (!date) return 23;
    const day = new Date(date).getDay();
    return day === 5 || day === 6 ? 24 : 23;
  };

  const generateTimes = () => {
    const times = [];
    const endHour = getMaxTimeByDay();
    for (let h = 9; h <= endHour; h++) {
      for (let m = 0; m < 60; m += 15) {
        const time = `${h.toString().padStart(2, "0")}:${m
          .toString()
          .padStart(2, "0")}`;
        times.push(time);
      }
    }
    return times;
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setPeople("");
    setRoom("");
    setDate(null);
    setStartTime("");
    setEndTime("");
    localStorage.removeItem("reservationData");
    localStorage.removeItem("reservationFinal");
    localStorage.removeItem("order");
    localStorage.removeItem("hasOrderedMenu"); // <-- Tambahkan ini
    setHasOrder(false);
    setOrderCount(0);
    setIsReadyToSubmit(false);
    setHasPromptedFood(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Jika user sudah pernah ke menu-order, langsung kirim reservasi
    if (localStorage.getItem("hasOrderedMenu") === "true") {
      try {
        const data = JSON.parse(localStorage.getItem("reservationFinal") || "{}");
        if (
          !data.name ||
          !data.phone ||
          !data.people ||
          !data.room ||
          !data.date ||
          !data.startTime ||
          !data.endTime ||
          !data.user_email
        ) {
          alert("Data reservasi tidak lengkap.");
          return;
        }
        await saveReservation(data);
        alert("Reservasi berhasil dikirim!");
        resetForm();
        setShowFoodPrompt(false);
        return;
      } catch (err) {
        alert("Gagal menyimpan reservasi: " + (err?.message || err));
        return;
      }
    }

    // Validasi form
    const reservationDate = date?.toISOString().split("T")[0];
    const totalPeople = Number(people);
    const roomMax = roomCapacity[room];
    const minRequired = roomMax * 0.8;

    if (totalPeople < minRequired) {
      alert(
        `Minimal reservasi untuk ${room.replace(
          "-",
          " "
        )} adalah ${minRequired} orang.`
      );
      return;
    }

    try {
      const existingPeople = await getReservationCount(
        reservationDate,
        startTime,
        endTime,
        room
      );

      if (existingPeople + totalPeople > roomMax) {
        alert("Maaf, ruangan sudah penuh di tanggal dan jam tersebut.");
        return;
      }

      // Simpan data reservasi ke localStorage untuk digunakan di prompt
      const orderRaw = JSON.parse(localStorage.getItem("order") || "{}");
      const orderArray = Object.entries(orderRaw).map(
        ([name, { qty, price }]) => ({
          name,
          qty,
          price,
          total: qty * price,
        })
      );

      const data = {
        name,
        phone,
        people: totalPeople,
        room,
        date: reservationDate,
        startTime,
        endTime,
        time: `${startTime} - ${endTime}`,
        user_email: user.email,
        order: orderArray.length > 0 ? orderArray : null,
        status: "incoming",
      };

      localStorage.setItem("reservationFinal", JSON.stringify(data));

      // Tampilkan prompt makanan hanya jika belum pernah submit form ini
      if (!hasPromptedFood) {
        setShowFoodPrompt(true);
        setIsReadyToSubmit(true);
        setHasPromptedFood(true);
        return;
      }

      // Jika sudah pernah prompt, langsung kirim reservasi
      await saveReservation(data);
      alert("Reservasi berhasil dikirim!");
      resetForm();
    } catch (error) {
      alert("Gagal menyimpan reservasi: " + error.message);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen bg-black text-white">
        <div className="relative w-full md:w-1/2 h-[400px] md:h-auto">
          <Image
            src="/image/reservation.jpg"
            alt="Table"
            fill
            className="object-cover"
          />
          <div className="absolute bottom-10 left-10">
            <h1 className="text-5xl font-serif">BOOK</h1>
            <h1 className="text-5xl font-serif">A TABLE</h1>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center p-10 bg-[#111]">
          <div className="w-full max-w-md">
            <h2 className="text-center text-2xl font-light mb-2 tracking-widest">
              RESERVASI
            </h2>
            <p className="text-center text-sm text-gray-400 mb-6">
              Enjoy the relaxed atmosphere at General Le Veteran, the perfect
              place to unwind and enjoy an unforgettable dining experience.
            </p>

            {user && (
              <div className="mb-4 text-right text-sm text-gray-400">
                Logged in as {user.email}
                <button
                  onClick={handleLogout}
                  className="underline hover:text-white ml-2"
                >
                  Logout
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                type="text"
                placeholder="Your Name"
                className="w-full bg-transparent border border-gray-600 px-4 py-2 rounded-md outline-none focus:border-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                name="phone"
                type="tel"
                placeholder="Phone Number use 62xxx-xxxx-xxxx"
                className="w-full bg-transparent border border-gray-600 px-4 py-2 rounded-md outline-none focus:border-white"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={roomCapacity[room] || ""}
                  placeholder="People"
                  className="w-1/3 bg-transparent border border-gray-600 px-4 py-2 rounded-md outline-none focus:border-white"
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                  required
                />

                <select
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-2/3 bg-black px-4 py-2 rounded-md outline-none border border-gray-600 text-white"
                  required
                >
                  <option value="" disabled hidden>
                    Choose Room
                  </option>
                  <option value="vintage-room">Vintage Room (40 seat)</option>
                  <option value="indoor-smoking">
                    Indoor Smoking (25 seat)
                  </option>
                  <option value="forest-smoking">
                    Forest Smoking (18 seat)
                  </option>
                  <option value="outdoor-space">Outdoor Space (30 seat)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <div className="w-1/3">
                  <DatePicker
                    selected={date}
                    onChange={setDate}
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Date"
                    className="w-full bg-transparent border rounded-md px-4 py-2 text-white border-gray-600"
                    required
                  />
                </div>
                <div className="w-1/3">
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-black border rounded-md px-4 py-2 text-white border-gray-600"
                    required
                  >
                    <option value="" disabled hidden>
                      Start
                    </option>
                    {generateTimes().map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-1/3">
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-black border rounded-md px-4 py-2 text-white border-gray-600"
                    required
                  >
                    <option value="" disabled hidden>
                      End
                    </option>
                    {generateTimes().map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#f8f2dc] text-black font-semibold py-2 rounded-md hover:opacity-90 transition"
              >
                SUBMIT
              </button>
            </form>

            {/* Tombol cek pesanan hanya render di client */}
            {isClient && hasOrder && (
              <button
                type="button"
                onClick={() => router.push("/menu-order")}
                className="w-full mt-4 bg-yellow-400 text-black font-semibold py-2 rounded-md hover:opacity-90 transition flex justify-center items-center gap-2"
              >
                🛒 Cek Pesanan ({orderCount})
              </button>
            )}

            <footer className="text-xs text-center text-gray-500 mt-8">
              ©Jendral Le Veteran
            </footer>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-[#222] p-6 rounded-md w-full max-w-sm text-white">
            <h3 className="text-xl mb-4 text-center">
              {isRegister ? "Register" : "Login"}
            </h3>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-transparent border border-gray-600 px-4 py-2 rounded-md outline-none focus:border-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-transparent border border-gray-600 px-4 py-2 rounded-md outline-none focus:border-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
              <button
                type="submit"
                className="w-full bg-[#f8f2dc] text-black font-semibold py-2 rounded-md hover:opacity-90 transition"
              >
                {isRegister ? "Register" : "Login"}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={loginWithGoogle}
                className="bg-white text-black px-4 py-2 rounded-md hover:opacity-90 transition"
              >
                Login with Google
              </button>
            </div>
            <div className="mt-4 text-center text-gray-400 text-sm">
              <span
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg("");
                }}
                className="cursor-pointer select-none"
              >
                {isRegister
                  ? "Already have an account? Login"
                  : "Don't have an account? Register"}
              </span>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAuthModal(false)}
                className="underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showFoodPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-[#222] p-6 rounded-md w-full max-w-sm text-white text-center space-y-4">
            <h3 className="text-xl font-semibold">Ingin pesan makanan juga?</h3>
            <p className="text-gray-400 text-sm">
              Jika ya, Anda akan diarahkan ke halaman pemesanan menu terlebih
              dahulu.
            </p>
            <div className="flex justify-around">
              <button
                onClick={() => {
                  setShowFoodPrompt(false);
                  setHasPromptedFood(false);
                  localStorage.setItem("hasOrderedMenu", "true"); // <-- Tambahkan ini
                  router.push("/menu-order");
                }}
                className="bg-[#f8f2dc] text-black px-4 py-2 rounded-md hover:opacity-90 transition"
              >
                Ya, pesan dulu
              </button>
              <button
                onClick={async () => {
                  try {
                    const data = JSON.parse(
                      localStorage.getItem("reservationFinal") || "{}"
                    );
                    if (
                      !data.name ||
                      !data.phone ||
                      !data.people ||
                      !data.room ||
                      !data.date ||
                      !data.startTime ||
                      !data.endTime ||
                      !data.user_email
                    ) {
                      alert("Data reservasi tidak lengkap.");
                      return;
                    }
                    await saveReservation(data);
                    alert("Reservasi berhasil dikirim!");
                    resetForm();
                    setShowFoodPrompt(false);
                  } catch (err) {
                    alert("Gagal menyimpan reservasi: " + (err?.message || err));
                  }
                }}
                className="bg-gray-700 px-4 py-2 rounded-md hover:opacity-90 transition"
              >
                Tidak, lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
