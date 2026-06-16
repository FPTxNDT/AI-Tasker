import { useState, useEffect } from "react";
import { Wallet, TrendingUp, ArrowDownCircle, Clock, DollarSign } from "lucide-react";
import { MoneyDisplay } from "../../components/shared/MoneyDisplay.jsx";
import { BackButton } from "../../components/shared/BackButton.jsx";
import { api } from "../../../services/api.js";
import { useAuth } from "../../hooks/useAuth.js";
import {
  getMockUserByEmail,
  getNormalizedWallet,
  getMockTransactionsByUser,
} from "../../../mock-db/mockDbService.js";
import { DEMO_EXPERT_ID } from "../../lib/demoConfig.js";

// ---------------------------------------------------------------------------
// Mock fallback data (uses centralized mock DB when backend is unreachable)
// ---------------------------------------------------------------------------

function resolveExpertId(user) {
  if (user?.email) {
    const mockUser = getMockUserByEmail(user.email);
    if (mockUser) return mockUser.id;
  }
  return DEMO_EXPERT_ID;
}

function getMockExpertWalletData(userId) {
  const normWallet = getNormalizedWallet(userId);
  const mockTransactions = getMockTransactionsByUser(userId);

  return {
    wallet: normWallet || { balance: 0, pendingBalance: 0, totalEarned: 0 },
    transactions: mockTransactions,
  };
}

const statusColors = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExpertWallet() {
  const { user } = useAuth();
  const userId = resolveExpertId(user);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Withdrawal form
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [wallet, transactions] = await Promise.all([
          api.payments.getWallet().catch(() => null),
          api.payments.getTransactions({ type: "expert" }).catch(() => null),
        ]);

        if (!cancelled) {
          if (wallet || transactions) {
            const mock = getMockExpertWalletData(userId);
            setData({
              wallet: wallet || mock.wallet,
              transactions: transactions || mock.transactions,
            });
          } else {
            setData(getMockExpertWalletData(userId));
          }
        }
      } catch {
        if (!cancelled) setData(getMockExpertWalletData(userId));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [userId]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) return;
    if (amount > (data?.wallet?.balance ?? 0)) {
      setFeedback({ type: "error", message: "Insufficient balance for this withdrawal." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      await api.payments.withdraw({ amount, method: paymentMethod });
      setFeedback({ type: "success", message: "Withdrawal request submitted successfully." });
    } catch {
      // Demo fallback
    }

    // Update local state (demo)
    setData((prev) => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        balance: prev.wallet.balance - amount,
      },
      transactions: [
        {
          id: `wt-${Date.now()}`,
          type: "withdrawal",
          amount,
          description: `Withdrawal via ${paymentMethod}`,
          status: "completed",
          createdAt: new Date().toISOString(),
        },
        ...prev.transactions,
      ],
    }));

    setFeedback({ type: "success", message: "Withdrawal processed (demo mode)." });
    setShowWithdrawForm(false);
    setWithdrawAmount(0);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackButton fallback="/expert/dashboard" className="mb-4">Back to Dashboard</BackButton>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600 mt-1">Manage your earnings and withdrawals.</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowWithdrawForm(!showWithdrawForm); setFeedback(null); }}
          className="px-5 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium inline-flex items-center gap-2"
        >
          <ArrowDownCircle className="w-4 h-4" /> Withdraw
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Withdrawal form */}
      {showWithdrawForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Withdrawal</h2>
          <form onSubmit={handleWithdraw} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USD)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={withdrawAmount || ""}
                onChange={(e) => setWithdrawAmount(e.target.value === "" ? 0 : Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900"
                placeholder="500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Available: <MoneyDisplay amount={data?.wallet?.balance ?? 0} />
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900 bg-white"
              >
                <option value="bank">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="crypto">Cryptocurrency</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || !withdrawAmount || withdrawAmount <= 0}
                className="px-5 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {submitting ? "Processing..." : "Request Withdrawal"}
              </button>
              <button
                type="button"
                onClick={() => setShowWithdrawForm(false)}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Wallet stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-xl font-bold text-gray-900">
                <MoneyDisplay amount={data?.wallet?.balance ?? 0} />
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending / In Escrow</p>
              <p className="text-xl font-bold text-gray-900">
                <MoneyDisplay amount={data?.wallet?.pendingBalance ?? 0} />
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Earned</p>
              <p className="text-xl font-bold text-gray-900">
                <MoneyDisplay amount={data?.wallet?.totalEarned ?? 0} />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
        </div>

        {!data?.transactions?.length ? (
          <div className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No transactions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{tx.description}</p>
                      {tx.projectTitle && (
                        <p className="text-xs text-gray-400 mt-0.5">{tx.projectTitle}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      <MoneyDisplay amount={tx.amount} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[tx.status] || "bg-gray-100 text-gray-700"}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
