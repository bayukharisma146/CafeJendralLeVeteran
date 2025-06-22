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
import { saveReservation } from "../../lib/reservasi"; // Tambahkan ini

export default function Reservasipage() {
  const [people, setPeople] = useState("");
  const [room, setRoom] = useState("");
  const [time, setTime] = useState("");
  const [ampm, setAmpm] = useState("AM");
  const [date, setDate] = useState(null);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      if (usr) setShowAuthModal(false);
    });
    return () => unsubscribe();
  }, []);

  const formatDate = (d) => {
    if (!d) return "";
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const form = e.currentTarget;
    const data = {
      name: form.name.value,
      phone: form.phone.value,
      people,
      room,
      date: date?.toISOString().split("T")[0], // YYYY-MM-DD format
      time,
      ampm,
      user_email: user.email,
    };

    try {
      await saveReservation(data);
      alert("Reservasi berhasil dikirim!");
      form.reset();
      setPeople("");
      setRoom("");
      setDate(null);
      setTime("");
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
                required
              />
              <input
                name="phone"
                type="tel"
                placeholder="Phone Number"
                className="w-full bg-transparent border border-gray-600 px-4 py-2 rounded-md outline-none focus:border-white"
                required
              />

              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={20}
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
                  <option value="vintage-room">Vintage Room</option>
                  <option value="indoor-smoking">Indoor Smoking</option>
                  <option value="forest-smoking">Forest Smoking</option>
                  <option value="outdoor-space">Outdoor Space</option>
                </select>
              </div>

              <div className="flex gap-2 w-full">
                <div className="flex-1">
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
                <div className="w-[35%]">
                  <input
                    type="text"
                    placeholder="HH:MM"
                    pattern="^(0[1-9]|1[0-2]):([0-5][0-9])$"
                    title="Format HH:MM (contoh: 09:30)"
                    className="w-full bg-transparent border rounded-md px-4 py-2 text-white border-gray-600"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
                <div className="w-[25%]">
                  <select
                    value={ampm}
                    onChange={(e) => setAmpm(e.target.value)}
                    className="w-full bg-black border rounded-md px-4 py-2 text-white border-gray-600"
                    required
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
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
    </>
  );
}
