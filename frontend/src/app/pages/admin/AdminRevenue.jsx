import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, BarChart3, ArrowUpRight } from "lucide-react";
import { MoneyDisplay } from "../../components/shared/MoneyDisplay.jsx";
import { BackButton } from "../../components/shared/BackButton.jsx";

// TEMP MOCK DB - replace with API call when backend is ready
import {
  getMockRevenueSummary,
  getMockUserById,
  getMockProjectById,
} from "../../../mock-db/mockDbService.js";

const typeLabels = {
  escrow_deposit: "Escrow Deposit",
  escrow_release: "Escrow Release",
  withdrawal: "Withdrawal",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminRevenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TEMP MOCK DB - replace with API call when backend is ready
    const timer = setTimeout(() => {
      const raw = getMockRevenueSummary();
      // Build transactions from monthly breakdown
      const transactions = raw.monthlyBreakdown.flatMap((m, i) => [
        ...(m.escrowProcessed > 0
          ? [{ id: `tx-${i}-escrow`, type: "escrow_deposit", amount: m.escrowProcessed, from: "Clients", to: "Escrow", project: `${m.month} total`, date: `${m.month}-15` }]
          : []),
        ...(m.withdrawals > 0
          ? [{ id: `tx-${i}-wd`, type: "withdrawal", amount: m.withdrawals, from: "Escrow", to: "Experts", project: `${m.month} total`, date: `${m.month}-20` }]
          : []),
        ...(m.fees > 0
          ? [{ id: `tx-${i}-fee`, type: "escrow_release", amount: m.fees, from: "Platform", to: "AITasker", project: `${m.month} fees`, date: `${m.month}-28` }]
          : []),
      ]);

      // Get this month and last month
      const months = raw.monthlyBreakdown;
      const thisMonthData = months[months.length - 1] || { fees: 0, escrowProcessed: 0 };
      const lastMonthData = months[months.length - 2] || { fees: 0, escrowProcessed: 0 };

      setData({
        summary: {
          totalRevenue: raw.totalPlatformFees,
          thisMonth: thisMonthData.fees,
          lastMonth: lastMonthData.fees,
          escrowHeld: 0, // Not in summary data
          paidToExperts: raw.totalWithdrawals,
        },
        transactions,
      });
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackButton fallback="/admin/dashboard" className="mb-4">Back to Dashboard</BackButton>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Revenue &amp; Transactions</h1>
      <p className="text-gray-600 mb-8">Platform revenue summary and transaction audit log.</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: <MoneyDisplay amount={s.totalRevenue} />, icon: TrendingUp, color: "text-green-600 bg-green-100" },
          { label: "This Month", value: <MoneyDisplay amount={s.thisMonth} />, icon: BarChart3, color: "text-blue-600 bg-blue-100", trend: "+10.5%" },
          { label: "In Escrow", value: <MoneyDisplay amount={s.escrowHeld} />, icon: DollarSign, color: "text-purple-600 bg-purple-100" },
          { label: "Paid to Experts", value: <MoneyDisplay amount={s.paidToExperts} />, icon: ArrowUpRight, color: "text-orange-600 bg-orange-100" },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-5 h-5" />
              </div>
              {card.trend && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {card.trend}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Transaction log */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Transaction Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">From</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">To</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Project</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 text-sm text-gray-700">{typeLabels[tx.type] || tx.type}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{tx.from || "—"}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{tx.to || "—"}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{tx.project || "—"}</td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    <MoneyDisplay amount={tx.amount} />
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-gray-500">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
