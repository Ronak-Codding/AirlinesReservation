import { useState, useEffect, useRef } from "react";
import {
  Search,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Trash2,
  IndianRupee,
  AlertCircle,
  CheckSquare,
  Square,
  BadgeCheck,
  Ban,
  MessageSquareText,
  Info,
} from "lucide-react";
import "./AdminTables.css";

const API_BASE = "http://localhost:5000/api/payment";
const GST_RATE = 0.18;

const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const calcNetRefund = (totalAmount) => {
  const base = totalAmount / (1 + GST_RATE);
  const gst = totalAmount - base;
  return {
    base: Math.round(base),
    gst: Math.round(gst),
    net: Math.round(base),
  };
};

const STATUS_CONFIG = {
  success: { label: "Success", className: "badge-success", icon: CheckCircle },
  failed: { label: "Failed", className: "badge-failed", icon: XCircle },
  pending: { label: "Pending", className: "badge-pending", icon: Clock },
  refunded: { label: "Refunded", className: "badge-refunded", icon: RefreshCw },
  refund_requested: {
    label: "Refund Requested",
    className: "badge-refund-requested",
    icon: MessageSquareText,
  },
};

const METHOD_CONFIG = {
  card: { label: "Card", icon: CreditCard, className: "badge-card" },
  upi: { label: "UPI", icon: Smartphone, className: "badge-upi" },
  netbanking: {
    label: "Net Banking",
    icon: Building2,
    className: "badge-netbanking",
  },
  wallet: { label: "Wallet", icon: Wallet, className: "badge-wallet" },
};

// ── Stats Card Config ──
const STAT_CARDS = [
  { key: "all", label: "Total Transactions", color: "#7F77DD" },
  { key: "success", label: "Success", color: "#1D9E75" },
  { key: "pending", label: "Pending", color: "#EF9F27" },
  { key: "failed", label: "Failed", color: "#E24B4A" },
  { key: "refund_requested", label: "Refund Requests", color: "#f97316" },
  { key: "refunded", label: "Refunded", color: "#60a5fa" },
];

// ── Reason Tooltip — position:fixed so it never gets clipped by table overflow ──
function ReasonTooltip({ reason }) {
  const [tooltipStyle, setTooltipStyle] = useState(null);
  const iconRef = useRef(null);

  const handleMouseEnter = () => {
    if (!iconRef.current) return;
    const rect = iconRef.current.getBoundingClientRect();
    setTooltipStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
      transform: "translateX(-50%)",
      zIndex: 99999,
    });
  };

  const handleMouseLeave = () => setTooltipStyle(null);

  if (!reason) return null;

  return (
    <>
      <span
        ref={iconRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          display: "inline-flex",
          alignItems: "center",
          marginLeft: 5,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <Info size={13} style={{ color: "#f97316" }} />
      </span>

      {tooltipStyle && (
        <div
          style={{
            ...tooltipStyle,
            background: "#1a1a2e",
            border: "1px solid rgba(249,115,22,0.45)",
            borderRadius: 10,
            padding: "10px 14px",
            minWidth: 160,
            maxWidth: 230,
            boxShadow: "0 8px 28px rgba(0,0,0,0.55)",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -7,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderBottom: "7px solid rgba(249,115,22,0.45)",
            }}
          />
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 10,
              fontWeight: 700,
              color: "#f97316",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            📋 Cancellation Reason
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#fdba74",
              lineHeight: 1.5,
            }}
          >
            {reason}
          </p>
        </div>
      )}
    </>
  );
}

// ── GST Breakdown ──
function RefundBreakdown({ amount }) {
  const { gst, net } = calcNetRefund(amount);
  return (
    <div
      style={{
        background: "rgba(16,185,129,0.06)",
        border: "0.5px solid rgba(16,185,129,0.25)",
        borderRadius: 10,
        padding: "14px 16px",
        marginTop: 12,
      }}
    >
      <p
        style={{
          margin: "0 0 10px",
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#065f46",
        }}
      >
        Refund Breakdown
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          marginBottom: 5,
          color: "var(--color-text-secondary)",
        }}
      >
        <span>Total Paid (GST incl.)</span>
        <span>{fmtINR(amount)}</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          marginBottom: 5,
          color: "#ef4444",
        }}
      >
        <span>GST Deducted (18%)</span>
        <span>− {fmtINR(gst)}</span>
      </div>
      <div
        style={{
          borderTop: "0.5px solid rgba(16,185,129,0.3)",
          paddingTop: 8,
          marginTop: 4,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 15,
          fontWeight: 600,
          color: "#10b981",
        }}
      >
        <span>Net Refund to User</span>
        <span>{fmtINR(net)}</span>
      </div>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 11,
          color: "var(--color-text-tertiary)",
        }}
      >
        * GST is a government tax and is non-refundable per policy.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
export default function AdminPayments({ token }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [exportFormat, setExportFormat] = useState("csv");
  const [refundModal, setRefundModal] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // ── Stats State ──
  const [stats, setStats] = useState({
    all: 0,
    success: 0,
    pending: 0,
    failed: 0,
    refund_requested: 0,
    refunded: 0,
  });

  const approveInProgress = useRef(false);
  const rejectInProgress = useRef(false);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    const t = setTimeout(() => fetchPayments(), 300);
    return () => clearTimeout(t);
  }, [page, status, method, search]);
  useEffect(() => {
    setSelectedPayments([]);
    setSelectAll(false);
  }, [payments]);

  // ── Fetch counts for all statuses ──
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}?limit=10000`, {
        headers: authHeaders,
      });
      const data = await res.json();
      const all = data.payments || [];
      setStats({
        all: data.total || 0,
        success: all.filter((p) => p.status === "success").length,
        pending: all.filter((p) => p.status === "pending").length,
        failed: all.filter((p) => p.status === "failed").length,
        refund_requested: all.filter((p) => p.status === "refund_requested")
          .length,
        refunded: all.filter((p) => p.status === "refunded").length,
      });
    } catch {
      console.error("Stats fetch failed");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        search,
        status,
        method,
      });
      const res = await fetch(`${API_BASE}?${params}`, {
        headers: authHeaders,
      });
      const data = await res.json();
      setPayments(data.payments || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setTotalRevenue(data.totalRevenue || 0);
    } catch (err) {
      console.error("fetchPayments error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPayments([]);
      setSelectAll(false);
    } else {
      setSelectedPayments(payments.map((p) => p._id));
      setSelectAll(true);
    }
  };
  const toggleSelect = (id) =>
    setSelectedPayments((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedPayments.length} payment record(s)?`))
      return;
    setLoading(true);
    try {
      await Promise.all(
        selectedPayments.map((id) =>
          fetch(`${API_BASE}/${id}`, {
            method: "DELETE",
            headers: authHeaders,
          }),
        ),
      );
      setSelectedPayments([]);
      setSelectAll(false);
      fetchPayments();
      fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    const { net, gst } = calcNetRefund(refundModal.amount);
    try {
      await fetch(`${API_BASE}/refund/${refundModal._id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          reason: refundReason || "Admin initiated refund",
          netRefundAmount: net,
          gstDeducted: gst,
        }),
      });
      setRefundModal(null);
      setRefundReason("");
      fetchPayments();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveRefund = async () => {
    if (approveInProgress.current) return;
    approveInProgress.current = true;
    setActionLoading(true);
    const { net, gst } = calcNetRefund(approveModal.amount);
    try {
      const res = await fetch(`${API_BASE}/refund/${approveModal._id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          reason: approveModal.refundReason || "Approved by admin",
          netRefundAmount: net,
          gstDeducted: gst,
        }),
      });
      if (res.ok) {
        setApproveModal(null);
        fetchPayments();
        fetchStats();
      } else console.error("Approve failed:", await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
      approveInProgress.current = false;
    }
  };

  const handleRejectRefund = async () => {
    if (!rejectReason.trim() || rejectInProgress.current) return;
    rejectInProgress.current = true;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/refund-reject/${rejectModal._id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ rejectReason }),
      });
      if (res.ok) {
        setRejectModal(null);
        setRejectReason("");
        fetchPayments();
        fetchStats();
      } else console.error("Reject failed:", await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
      rejectInProgress.current = false;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this payment record?")) return;
    try {
      await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      fetchPayments();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const exportPayments = () => {
    if (exportFormat === "csv") {
      window.open(`${API_BASE}/export/csv`, "_blank");
    } else {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(
        new Blob([JSON.stringify(payments, null, 2)], {
          type: "application/json",
        }),
      );
      a.download = `payments_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    }
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const pendingRefundCount = stats.refund_requested;

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Payments</h1>
          <p className="admin-page-subtitle">
            Total: {total} transactions &nbsp;|&nbsp; Revenue:{" "}
            <strong style={{ color: "#10b981" }}>
              ₹{totalRevenue.toLocaleString("en-IN")}
            </strong>
          </p>
        </div>
        <div className="admin-header-actions">
          <select
            className="btn-export-select"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
          <button className="btn-export" onClick={exportPayments}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {pendingRefundCount > 0 && (
        <div className="ap-refund-alert">
          <div className="ap-refund-alert-left">
            <MessageSquareText size={18} color="#f97316" />
            <div>
              <p className="ap-refund-alert-title">
                {pendingRefundCount} Pending Refund Request
                {pendingRefundCount > 1 ? "s" : ""}
              </p>
              <p className="ap-refund-alert-sub">
                Users have submitted refund requests awaiting your approval.
              </p>
            </div>
          </div>
          <button
            className="ap-refund-alert-btn"
            onClick={() => {
              setStatus("refund_requested");
              setPage(1);
            }}
          >
            Review Requests →
          </button>
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "12px",
          marginBottom: "1.5rem",
        }}
      >
        {STAT_CARDS.map(({ key, label, color }) => (
          <div
            key={key}
            onClick={() => {
              setStatus(key);
              setPage(1);
            }}
            style={{
              background: "var(--secondary, rgba(255,255,255,0.05))",
              borderRadius: "0.75rem",
              padding: "1rem 1.25rem",
              borderLeft: `3px solid ${color}`,
              cursor: "pointer",
              transition: "opacity 0.2s",
              outline:
                status === key ? `2px solid ${color}` : "2px solid transparent",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                margin: "0 0 6px",
                fontWeight: 400,
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontSize: "26px",
                fontWeight: 500,
                color,
                margin: "0 0 4px",
                lineHeight: 1,
              }}
            >
              {key === "all"
                ? `₹${totalRevenue.toLocaleString("en-IN")}`
                : stats[key]}
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-secondary)",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: color,
                  display: "inline-block",
                }}
              />
              {status === key ? "Active filter" : "Click to filter"}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="admin-search-wrapper">
          <Search size={16} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search by TXN ID, Name, Email, Flight..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="admin-input admin-input-search"
          />
        </div>
        <select
          className="admin-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
          <option value="refund_requested">Refund Requested</option>
        </select>
        <select
          className="admin-select"
          value={method}
          onChange={(e) => {
            setMethod(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Methods</option>
          <option value="card">Card</option>
          <option value="upi">UPI</option>
          <option value="netbanking">Net Banking</option>
          <option value="wallet">Wallet</option>
        </select>
      </div>

      {/* Bulk Bar */}
      {selectedPayments.length > 0 && (
        <div className="users-bulk-bar">
          <span className="users-bulk-count">
            {selectedPayments.length} payment(s) selected
          </span>
          <div className="users-bulk-actions">
            <button
              className="users-bulk-btn users-bulk-blocked"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>
            <button
              className="users-bulk-btn users-bulk-clear"
              onClick={() => {
                setSelectedPayments([]);
                setSelectAll(false);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <button
                    onClick={handleSelectAll}
                    className="passengers-check-btn"
                  >
                    {selectAll ? (
                      <CheckSquare size={16} style={{ color: "#667eea" }} />
                    ) : (
                      <Square
                        size={16}
                        style={{ color: "var(--text-secondary)" }}
                      />
                    )}
                  </button>
                </th>
                {[
                  "Transaction ID",
                  "Passenger",
                  "Flight",
                  "Route",
                  "Amount",
                  "Method",
                  "Status",
                  "Date & Time",
                  "Actions",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="admin-table-loading">
                    <Loader2
                      size={32}
                      className="admin-table-empty-icon"
                      style={{ opacity: 1, color: "#667eea" }}
                    />
                    <p>Loading payments...</p>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="admin-table-empty">
                    <CreditCard size={48} className="admin-table-empty-icon" />
                    <p>No payments found</p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const statusConfig =
                    STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                  const methodConfig =
                    METHOD_CONFIG[p.paymentMethod] || METHOD_CONFIG.card;
                  const StatusIcon = statusConfig.icon;
                  const MethodIcon = methodConfig.icon;
                  const isSelected = selectedPayments.includes(p._id);
                  const isRefundReq = p.status === "refund_requested";

                  return (
                    <tr
                      key={p._id}
                      style={
                        isRefundReq
                          ? {
                              background: "rgba(249,115,22,0.05)",
                              borderLeft: "3px solid #f97316",
                            }
                          : isSelected
                            ? { background: "rgba(102,126,234,0.08)" }
                            : {}
                      }
                    >
                      <td>
                        <button
                          onClick={() => toggleSelect(p._id)}
                          className="passengers-check-btn"
                        >
                          {isSelected ? (
                            <CheckSquare
                              size={16}
                              style={{ color: "#667eea" }}
                            />
                          ) : (
                            <Square
                              size={16}
                              style={{ color: "var(--text-secondary)" }}
                            />
                          )}
                        </button>
                      </td>
                      <td>
                        <p className="cell-accent">{p.transactionId}</p>
                        <p
                          className="cell-muted"
                          style={{ fontSize: "0.75rem", margin: "0.25rem 0 0" }}
                        >
                          BK{p.bookingId?.toString().slice(-6).toUpperCase()}
                        </p>
                      </td>
                      <td>
                        <p className="admin-avatar-name">
                          {p.passengerName || "—"}
                        </p>
                        {/* <p className="admin-avatar-sub">{p.email || "—"}</p> */}
                      </td>
                      <td>{p.flightNumber || "—"}</td>
                      <td>
                        {p.from} → {p.to}
                      </td>
                      <td className="cell-success">
                        ₹{p.amount?.toLocaleString("en-IN")}
                      </td>
                      <td>
                        <div className={methodConfig.className}>
                          <MethodIcon size={14} /> {methodConfig.label}
                        </div>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span
                            className={statusConfig.className}
                            style={{ whiteSpace: "nowrap" }}
                          >
                            <StatusIcon size={12} /> {statusConfig.label}
                          </span>
                          {isRefundReq && p.refundReason && (
                            <ReasonTooltip reason={p.refundReason} />
                          )}
                        </div>
                      </td>
                      <td
                        className="cell-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {formatDate(p.createdAt)}
                      </td>
                      <td>
                        <div className="cell-actions">
                          {isRefundReq && (
                            <>
                              <button
                                className="ap-approve-btn"
                                onClick={() => setApproveModal(p)}
                              >
                                <BadgeCheck size={13} /> Approve
                              </button>
                              <button
                                className="ap-reject-btn"
                                onClick={() => {
                                  setRejectModal(p);
                                  setRejectReason("");
                                }}
                              >
                                <Ban size={13} /> Reject
                              </button>
                            </>
                          )}
                          {p.status === "success" && (
                            <button
                              className="btn-warning"
                              onClick={() => setRefundModal(p)}
                            >
                              <RefreshCw size={12} /> Refund
                            </button>
                          )}
                          {p.status !== "refund_requested" && (
                            <button
                              className="btn-danger"
                              onClick={() => handleDelete(p._id)}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="admin-pagination">
        <p className="admin-pagination-info">
          Showing {Math.min((page - 1) * 10 + 1, total)}–
          {Math.min(page * 10, total)} of {total}
        </p>
        <div className="admin-pagination-buttons">
          <button
            className="pagination-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} /> Prev
          </button>
          {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`pagination-btn ${page === p ? "pagination-btn-active" : ""}`}
              >
                {p}
              </button>
            ),
          )}
          <button
            className="pagination-btn"
            disabled={page === pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ════ APPROVE MODAL ════ */}
      {approveModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => setApproveModal(null)}
        >
          <div
            className="admin-modal admin-modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2 className="admin-modal-title">Approve Refund Request</h2>
                <p className="admin-modal-subtitle">
                  TXN: {approveModal.transactionId}
                </p>
              </div>
            </div>
            <div className="admin-modal-body">
              <div className="ap-modal-info-row">
                <span>Passenger</span>
                <strong>{approveModal.passengerName || "—"}</strong>
              </div>
              <div className="ap-modal-info-row">
                <span>Route</span>
                <strong>
                  {approveModal.from} → {approveModal.to}
                </strong>
              </div>
              {approveModal.refundReason && (
                <div className="ap-reason-box">
                  <p className="ap-reason-label">
                    <MessageSquareText size={13} /> Cancellation Reason
                  </p>
                  <p className="ap-reason-text">
                    "{approveModal.refundReason}"
                  </p>
                </div>
              )}
              <RefundBreakdown amount={approveModal.amount} />
              <div className="ap-confirm-box" style={{ marginTop: 12 }}>
                <BadgeCheck size={16} color="#10b981" />
                Approving will mark as <strong>Refunded</strong> and email user
                the net refund amount.
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setApproveModal(null)}
              >
                Cancel
              </button>
              <button
                className="ap-approve-modal-btn"
                onClick={handleApproveRefund}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <RefreshCw size={14} className="cr-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <BadgeCheck size={14} /> Approve &amp; Refund
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ REJECT MODAL ════ */}
      {rejectModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => setRejectModal(null)}
        >
          <div
            className="admin-modal admin-modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2 className="admin-modal-title">Reject Refund Request</h2>
                <p className="admin-modal-subtitle">
                  TXN: {rejectModal.transactionId}
                </p>
              </div>
            </div>
            <div className="admin-modal-body">
              <div className="ap-modal-info-row">
                <span>Passenger</span>
                <strong>{rejectModal.passengerName || "—"}</strong>
              </div>
              <div className="ap-modal-info-row">
                <span>Amount</span>
                <strong>₹{rejectModal.amount?.toLocaleString("en-IN")}</strong>
              </div>
              {rejectModal.refundReason && (
                <div className="ap-reason-box">
                  <p className="ap-reason-label">
                    <MessageSquareText size={13} /> User's Cancellation Reason
                  </p>
                  <p className="ap-reason-text">"{rejectModal.refundReason}"</p>
                </div>
              )}
              <div
                className="admin-form-group"
                style={{ marginTop: "0.75rem" }}
              >
                <label className="admin-form-label">
                  Rejection Reason <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Why is this refund being rejected?"
                  rows={3}
                  className="admin-input"
                  style={{ resize: "vertical" }}
                />
              </div>
              <div className="ap-reject-warn-box">
                <AlertCircle size={15} color="#ef4444" />
                Rejecting will revert the payment back to{" "}
                <strong>Success</strong> status.
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setRejectModal(null)}
              >
                Cancel
              </button>
              <button
                className="ap-reject-modal-btn"
                onClick={handleRejectRefund}
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? (
                  <>
                    <RefreshCw size={14} className="cr-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Ban size={14} /> Reject Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ DIRECT REFUND MODAL ════ */}
      {refundModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => {
            setRefundModal(null);
            setRefundReason("");
          }}
        >
          <div
            className="admin-modal admin-modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2 className="admin-modal-title">Initiate Refund</h2>
                <p className="admin-modal-subtitle">
                  TXN: {refundModal.transactionId}
                </p>
              </div>
            </div>
            <div className="admin-modal-body">
              <RefundBreakdown amount={refundModal.amount} />
              <div
                className="admin-form-group"
                style={{ marginTop: "0.75rem" }}
              >
                <label className="admin-form-label">Refund Reason</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Enter reason for refund..."
                  rows={3}
                  className="admin-input"
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setRefundModal(null);
                  setRefundReason("");
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1.25rem",
                  borderRadius: "0.75rem",
                  background: "#f97316",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                <RefreshCw size={16} /> Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
