            "use client";

            import { useEffect, useState } from "react";
            import { auth, onAuthStateChanged } from "@/lib/firebase";
            import { getApprovedReservations } from "@/lib/reservasi";
            import {
            LineChart,
            Line,
            XAxis,
            YAxis,
            CartesianGrid,
            Tooltip,
            ResponsiveContainer,
            PieChart,
            Pie,
            Cell,
            Legend,
            } from "recharts";
            import { ChevronDown } from "lucide-react";
            import * as XLSX from "xlsx";
            import { saveAs } from "file-saver";

            const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A"];

            export default function ApprovedReservationPage() {
            const [user, setUser] = useState(null);
            const [loading, setLoading] = useState(true);
            const [reservations, setReservations] = useState([]);
            const [filter, setFilter] = useState("bulan");
            const [dropdownOpen, setDropdownOpen] = useState(false);
            const [startDate, setStartDate] = useState("");
            const [endDate, setEndDate] = useState("");

            useEffect(() => {
                const unsub = onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser?.email === "jendralleveteran@gmail.com") {
                    setUser(currentUser);
                    await fetchReservations();
                } else {
                    alert("Unauthorized");
                }
                setLoading(false);
                });

                return () => unsub();
            }, []);

            const fetchReservations = async () => {
                const data = await getApprovedReservations();
                setReservations(data);
            };

            const generateLineData = () => {
                const grouped = {};
                const today = new Date();

                if (filter === "minggu") {
                const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());

                days.forEach((d) => (grouped[d] = 0));

                reservations.forEach((r) => {
                    const dateObj = new Date(r.date);
                    const dayIndex = dateObj.getDay();
                    const dayName = days[dayIndex];

                    const diff = (dateObj - weekStart) / (1000 * 60 * 60 * 24);
                    if (diff >= 0 && diff < 7) {
                    grouped[dayName]++;
                    }
                });

                return days.map((d) => ({ name: d, total: grouped[d] }));
                }

                if (filter === "bulan") {
                const months = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "Mei",
                    "Jun",
                    "Jul",
                    "Agu",
                    "Sep",
                    "Okt",
                    "Nov",
                    "Des",
                ];
                months.forEach((m) => (grouped[m] = 0));

                reservations.forEach((r) => {
                    const dateObj = new Date(r.date);
                    if (!isNaN(dateObj)) {
                    if (dateObj.getFullYear() === today.getFullYear()) {
                        const m = dateObj.getMonth();
                        grouped[months[m]]++;
                    }
                    }
                });

                return months.map((m) => ({ name: m, total: grouped[m] }));
                }

                if (filter === "tahun") {
                const years = {};
                reservations.forEach((r) => {
                    const y = new Date(r.date).getFullYear();
                    years[y] = (years[y] || 0) + 1;
                });
                return Object.keys(years).map((y) => ({ name: y, total: years[y] }));
                }
            };

            const generatePieData = () => {
                const grouped = {};
                const today = new Date();
                reservations.forEach((r) => {
                const dateObj = new Date(r.date);
                if (filter === "minggu") {
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    const diff = (dateObj - weekStart) / (1000 * 60 * 60 * 24);
                    if (diff >= 0 && diff < 7) {
                    grouped[r.room] = (grouped[r.room] || 0) + 1;
                    }
                } else if (filter === "bulan") {
                    if (dateObj.getFullYear() === today.getFullYear()) {
                    grouped[r.room] = (grouped[r.room] || 0) + 1;
                    }
                } else if (filter === "tahun") {
                    if (dateObj.getFullYear() === today.getFullYear()) {
                    grouped[r.room] = (grouped[r.room] || 0) + 1;
                    }
                }
                });
                return Object.keys(grouped).map((room) => ({
                name: room,
                value: grouped[room],
                }));
            };

            const handleExportExcel = () => {
                const filtered = reservations.filter((res) => {
                const date = new Date(res.date);
                const from = new Date(startDate);
                const to = new Date(endDate);
                return date >= from && date <= to;
                });

                const dataToExport = filtered.map((res) => ({
                Nama: res.name,
                Telepon: res.phone,
                Tanggal: res.date,
                Jam: res.time,
                Orang: res.people,
                Ruangan: res.room,
                }));

                const worksheet = XLSX.utils.json_to_sheet(dataToExport);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Reservasi");

                const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
                });

                const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
                saveAs(blob, `Reservasi_${startDate}_sampai_${endDate}.xlsx`);
            };

            if (loading) return <p className="text-white p-6">Loading...</p>;
            if (!user) return null;

            return (
            <div className="min-h-screen bg-black text-white p-6">
                <h1 className="text-3xl font-bold mb-4">Approved Reservations</h1>

                <div className="flex justify-end mb-4 relative">
                <button
                    className="bg-gray-700 px-4 py-2 rounded flex items-center gap-2"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    <ChevronDown size={18} />
                </button>
                {dropdownOpen && (
                    <div className="absolute top-12 right-0 bg-white text-black rounded shadow-lg z-10">
                    {["minggu", "bulan", "tahun"].map((f) => (
                        <button
                        key={f}
                        onClick={() => {
                            setFilter(f);
                            setDropdownOpen(false);
                        }}
                        className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
                        >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                    </div>
                )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-4 rounded-xl">
                    <h2 className="text-lg font-bold mb-2">
                    Grafik Reservasi ({filter})
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={generateLineData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                        dataKey="name"
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#8884d8"
                        strokeWidth={2}
                        />
                    </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-gray-800 p-4 rounded-xl">
                    <h2 className="text-lg font-bold mb-2">Ruangan Favorit</h2>
                    <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                        data={generatePieData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label
                        >
                        {generatePieData().map((entry, index) => (
                            <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                        </Pie>
                        <Legend />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
                </div>

                <div className="mt-8 bg-gray-900 p-4 rounded-xl overflow-auto">
                <h2 className="text-lg font-bold mb-4">Daftar Reservasi</h2>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                    <div className="flex gap-4">
                    <label className="flex flex-col text-sm">
                        <span className="mb-1">Dari</span>
                        <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="text-black px-2 py-1 rounded"
                        />
                    </label>
                    <label className="flex flex-col text-sm">
                        <span className="mb-1">Hingga</span>
                        <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="text-black px-2 py-1 rounded"
                        />
                    </label>
                    </div>

                    <button
                    onClick={handleExportExcel}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                    Export Excel
                    </button>
                </div>

                <table className="w-full table-auto text-sm text-white border border-gray-700">
                    <thead>
                    <tr className="bg-gray-800 text-left">
                        <th className="px-3 py-2 border-b">Nama</th>
                        <th className="px-3 py-2 border-b">Telepon</th>
                        <th className="px-3 py-2 border-b">Tanggal</th>
                        <th className="px-3 py-2 border-b">Jam</th>
                        <th className="px-3 py-2 border-b">Orang</th>
                        <th className="px-3 py-2 border-b">Ruangan</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reservations
                        .filter((res) => {
                        const date = new Date(res.date);
                        const now = new Date();
                        const start = startDate
                            ? new Date(startDate)
                            : new Date(now.getFullYear(), now.getMonth(), 1);
                        const end = endDate
                            ? new Date(endDate)
                            : new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        return date >= start && date <= end;
                        })
                        .map((res) => (
                        <tr key={res.id} className="border-t border-gray-700">
                            <td className="px-3 py-2">{res.name}</td>
                            <td className="px-3 py-2">{res.phone}</td>
                            <td className="px-3 py-2">{res.date}</td>
                            <td className="px-3 py-2">{res.time}</td>
                            <td className="px-3 py-2">{res.people}</td>
                            <td className="px-3 py-2">{res.room}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
            );
            }
