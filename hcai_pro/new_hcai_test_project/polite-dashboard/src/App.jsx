import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

/**
 * Tone‑Analytics Dashboard – grouped bar chart (separate bars for each category)
 * Tailwind CSS + Recharts + Framer‑Motion
 */

const TONE_COLORS = {
  angry: "#EA4335", // red
  informal: "#FBBC05", // yellow
  formal: "#4285F4", // blue
  neutral: "#34A853", // green
};

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("7d");

  useEffect(() => {
    const endpoint =
      "https://0ec2-141-44-228-191.ngrok-free.app/stats/daily-tone";

    setLoading(true);
    fetch(endpoint, { headers: { "ngrok-skip-browser-warning": "true" } })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch data");
        return r.json();
      })
      .then((rows) => {
        const tones = Object.keys(TONE_COLORS);
        const byDay = {};

        rows.forEach(({ day, tone, total }) => {
          tone = (tone || "neutral").toLowerCase().trim();
          if (!byDay[day]) {
            byDay[day] = { day };
            tones.forEach((t) => (byDay[day][t] = 0));
          }
          if (tones.includes(tone)) {
            byDay[day][tone] = Number(total);
          }
        });
        setData(Object.values(byDay));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleExport = () => {
    const csvContent = [
      ["Day", ...Object.keys(TONE_COLORS)],
      ...data.map((row) => [
        row.day,
        ...Object.keys(TONE_COLORS).map((tone) => row[tone] || 0),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tone_analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("default", {
      day: "2-digit",
      month: "short",
    });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-8 sm:p-12"
      >
        {/* HEADER */}
        <header className="flex flex-col items-center gap-6 mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Tone Analytics Dashboard
          </h1>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm"
            >
              Export CSV
            </button>
          </div>
        </header>

        {/* CONTENT */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-8 bg-rose-50 border rounded-xl text-center">
            <p className="text-rose-700 font-semibold">{error}</p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 shadow-inner">
            <ResponsiveContainer width="100%" height={560}>
              <BarChart
                data={data}
                margin={{ top: 20, right: 40, left: 10, bottom: 0 }}
                barCategoryGap={16} /* gap between groups */
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="day"
                  tickFormatter={fmtDate}
                  tick={{ fill: "#374151", fontSize: 12, fontFamily: "Inter" }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={{ stroke: "#d1d5db" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#374151", fontSize: 12, fontFamily: "Inter" }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={{ stroke: "#d1d5db" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
                  }}
                  labelFormatter={(label) => fmtDate(label)}
                />
                <Legend wrapperStyle={{ paddingTop: 20, fontSize: 14 }} />

                {Object.entries(TONE_COLORS).map(([tone, color]) => (
                  <Bar
                    key={tone}
                    dataKey={tone}
                    fill={color}
                    barSize={14} // narrower bars
                    radius={[3, 3, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <footer className="mt-10 text-center text-xs text-gray-500">
          Updated: {new Date().toLocaleString()}
        </footer>
      </motion.div>
    </div>
  );
}
