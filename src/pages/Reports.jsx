import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  BadgeDollarSign,
  CalendarDays,
  FileBarChart2,
  UserRound,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function SummaryCard({ icon: Icon, label, value, tone = "light" }) {
  const className =
    tone === "dark"
      ? "rounded-xl border border-sky-200 bg-sky-600 p-5 text-white"
      : "surface-card rounded-xl p-5";

  return (
    <div className={className}>
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-lg ${
          tone === "dark" ? "bg-white text-sky-700" : "bg-sky-600 text-white"
        }`}
      >
        <Icon size={20} />
      </div>
      <p className={`mt-4 text-sm ${tone === "dark" ? "text-sky-50/90" : "text-slate-500"}`}>{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function Reports() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/stock/reports`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP Error ${response.status}: failed to load report`);
      }

      const data = await response.json();
      setRecords(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const totalIn = records.filter((record) => record.type === "IN").length;
    const totalOut = records.filter((record) => record.type === "OUT").length;
    const totalValueOut = records
      .filter((record) => record.type === "OUT" && record.totalPrice)
      .reduce((sum, record) => sum + Number(record.totalPrice), 0);

    return {
      totalIn,
      totalOut,
      totalValueOut,
    };
  }, [records]);

  return (
    <div className="page-shell px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="surface-card rounded-xl px-6 py-8 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-500">Reports</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-800">Transaction reporting</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                Review stock movement, compare inbound and outbound activity, and inspect each recorded transaction.
              </p>
            </div>
            <div className="inline-flex items-center gap-3 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-500">
              <CalendarDays size={18} />
              Live report from current transaction data
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800">
            {error}
          </div>
        )}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={Activity} label="Total Transactions" value={records.length.toLocaleString()} tone="dark" />
          <SummaryCard icon={ArrowDownToLine} label="Stock In Entries" value={summary.totalIn.toLocaleString()} />
          <SummaryCard icon={ArrowUpFromLine} label="Stock Out Entries" value={summary.totalOut.toLocaleString()} />
          <SummaryCard
            icon={BadgeDollarSign}
            label="Total Out Value"
            value={`${summary.totalValueOut.toFixed(2)} Frw`}
          />
        </section>

        <section className="surface-card overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-sky-100 px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Transaction History</h2>
              <p className="mt-1 text-sm text-slate-500">
                A combined view of stock in and stock out records.
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-600 text-white">
              <FileBarChart2 size={19} />
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center text-sm uppercase tracking-[0.25em] text-gray-500">
              Loading report
            </div>
          ) : records.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700">
                <FileBarChart2 size={28} />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-800">No transactions yet</h3>
              <p className="mt-2 text-sm text-slate-500">Once stock activity is recorded, it will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-sky-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em]">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em]">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em]">Part</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em]">Category</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.24em]">Quantity</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.24em]">Rate / Supplier</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.24em]">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em]">Recipient / Supplier</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em]">Notes</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em]">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-50">
                  {records.map((record, index) => {
                    const date = new Date(record.date).toLocaleString();
                    const name = record.sparePart?.name || "-";
                    const category = record.sparePart?.category || "-";
                    const unitOrInfo =
                      record.type === "OUT"
                        ? `${Number(record.unitPrice || 0).toFixed(2)} Frw`
                        : record.supplier || "-";
                    const total =
                      record.type === "OUT" && record.totalPrice
                        ? `${Number(record.totalPrice).toFixed(2)} Frw`
                        : "-";
                    const issuedOrSupplier =
                      record.type === "OUT" ? record.issuedTo || "-" : record.supplier || "-";
                    const user = record.createdBy?.username || "-";

                    return (
                      <tr key={`${record.type}-${record.date}-${index}`} className="transition hover:bg-sky-50/60">
                        <td className="px-6 py-4 text-sm text-slate-500">{date}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-semibold ${
                              record.type === "IN" ? "bg-sky-50 text-sky-700" : "bg-sky-600 text-white"
                            }`}
                          >
                            {record.type === "IN" ? <ArrowDownToLine size={12} /> : <ArrowUpFromLine size={12} />}
                            {record.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{category}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-slate-800">{record.quantity}</td>
                        <td className="px-6 py-4 text-right text-sm text-slate-500">{unitOrInfo}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-slate-800">{total}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{issuedOrSupplier}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{record.notes || "-"}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 rounded-md border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                            <UserRound size={12} />
                            {user}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
