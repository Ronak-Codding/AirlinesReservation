import React, { useEffect, useState } from "react";
import {
  Eye,
  Trash2,
  RefreshCw,
  Download,
  Search,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import "./AdminTables.css";
import "./AdminUsers.css";
import "./AdminContacts.css";

// ── Stats Card Config ──
const STAT_CARDS = [
  { key: "", label: "Total Messages", color: "#7F77DD" },
  { key: "new", label: "New", color: "#EF9F27" },
  { key: "read", label: "Read", color: "#1D9E75" },
];

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewContact, setViewContact] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const contactsPerPage = 10;

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000,
    );
  };

  const loadContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/contact/allContact");
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      showNotification("Failed to load contacts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateRange]);

  // Reset selection when page/filter changes
  useEffect(() => {
    setSelectedContacts([]);
    setSelectAll(false);
  }, [currentPage, search, statusFilter, dateRange]);

  // ── Stats (derived from contacts array) ──
  const stats = {
    "": contacts.length,
    new: contacts.filter((c) => c.status === "new").length,
    read: contacts.filter((c) => c.status === "read").length,
  };

  const filteredContactsData = () =>
    contacts.filter((c) => {
      const matchSearch =
        !search ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        (c.subject || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.message || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || c.status === statusFilter;
      const matchDate =
        !dateRange.start ||
        !dateRange.end ||
        (new Date(c.createdAt) >= new Date(dateRange.start) &&
          new Date(c.createdAt) <= new Date(dateRange.end));
      return matchSearch && matchStatus && matchDate;
    });

  const sortedContacts = () => {
    return [...filteredContactsData()].sort((a, b) => {
      let aVal = a[sortConfig.key],
        bVal = b[sortConfig.key];
      if (sortConfig.key === "createdAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else {
        aVal = (aVal || "").toLowerCase();
        bVal = (bVal || "").toLowerCase();
      }
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredAndSortedContacts = sortedContacts();
  const totalPages = Math.ceil(
    filteredAndSortedContacts.length / contactsPerPage,
  );
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredAndSortedContacts.slice(
    indexOfFirstContact,
    indexOfLastContact,
  );

  const handleView = async (contact) => {
    setViewContact(contact);
    if (contact.status === "new") {
      try {
        await fetch(`http://localhost:5000/api/contact/${contact._id}/status`, {
          method: "PUT",
        });
        showNotification("Message marked as read");
        loadContacts();
      } catch {
        showNotification("Failed to update status", "error");
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "new" ? "read" : "new";
    try {
      await fetch(`http://localhost:5000/api/contact/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      showNotification(`Status updated to ${newStatus}`);
      loadContacts();
    } catch {
      showNotification("Failed to update status", "error");
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await fetch(`http://localhost:5000/api/contact/deleteContact/${id}`, {
        method: "DELETE",
      });
      showNotification("Message deleted");
      loadContacts();
    } catch {
      showNotification("Failed to delete", "error");
    }
  };

  // ── Checkbox handlers ──
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContacts([]);
      setSelectAll(false);
    } else {
      setSelectedContacts(currentContacts.map((c) => c._id));
      setSelectAll(true);
    }
  };

  const toggleContactSelection = (id) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // ── Bulk Delete ──
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedContacts.length} messages?`)) return;
    setLoading(true);
    try {
      await Promise.all(
        selectedContacts.map((id) =>
          fetch(`http://localhost:5000/api/contact/deleteContact/${id}`, {
            method: "DELETE",
          }),
        ),
      );
      setContacts(contacts.filter((c) => !selectedContacts.includes(c._id)));
      setSelectedContacts([]);
      setSelectAll(false);
      showNotification(`${selectedContacts.length} messages deleted`);
    } catch {
      showNotification("Failed to delete messages", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Bulk Status Update ──
  const handleBulkStatusUpdate = async (newStatus) => {
    if (!newStatus) return;
    setLoading(true);
    try {
      await Promise.all(
        selectedContacts.map((id) =>
          fetch(`http://localhost:5000/api/contact/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          }),
        ),
      );
      await loadContacts();
      setSelectedContacts([]);
      setSelectAll(false);
      showNotification(
        `${selectedContacts.length} messages updated to ${newStatus}`,
      );
    } catch {
      showNotification("Failed to update", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportContacts = () => {
    const dataToExport = filteredAndSortedContacts;
    if (exportFormat === "csv") {
      const headers = [
        "Full Name",
        "Email",
        "Phone",
        "Subject",
        "Message",
        "Status",
        "Received Date",
      ];
      const csvData = dataToExport.map((c) => [
        c.fullName || "N/A",
        c.email || "N/A",
        c.phone || "N/A",
        c.subject || "N/A",
        (c.message || "N/A").replace(/,/g, ";"),
        c.status || "N/A",
        new Date(c.createdAt).toLocaleDateString(),
      ]);
      const csv = [headers, ...csvData]
        .map((r) => r.map((v) => `"${v}"`).join(","))
        .join("\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      a.download = `contacts_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } else {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(
        new Blob([JSON.stringify(dataToExport, null, 2)], {
          type: "application/json",
        }),
      );
      a.download = `contacts_export_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    }
    showNotification(`Exported ${dataToExport.length} messages`);
  };

  const SortIcon = ({ col }) =>
    sortConfig.key === col
      ? sortConfig.direction === "asc"
        ? " ↑"
        : " ↓"
      : "";

  return (
    <div>
      {/* Loading Overlay */}
      {loading && (
        <div className="users-loading-overlay">
          <div className="users-loading-box">
            <div className="users-spinner" />
            <p>Loading contacts...</p>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div
          className={`users-notification ${notification.type === "error" ? "users-notification-error" : "users-notification-success"}`}
        >
          {notification.message}
        </div>
      )}

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Contact Messages</h1>
          <p className="admin-page-subtitle">
            Total: <strong>{contacts.length}</strong> | Filtered:{" "}
            <strong>{filteredAndSortedContacts.length}</strong> | New:{" "}
            <strong style={{ color: "#eab308" }}>
              {contacts.filter((c) => c.status === "new").length}
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
          <button className="btn-export" onClick={exportContacts}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          marginBottom: "1.5rem",
        }}
      >
        {STAT_CARDS.map(({ key, label, color }) => (
          <div
            key={key || "all"}
            onClick={() => {
              setStatusFilter(key);
              setCurrentPage(1);
            }}
            style={{
              background: "var(--secondary, rgba(255,255,255,0.05))",
              borderRadius: "0.75rem",
              padding: "1rem 1.25rem",
              borderLeft: `3px solid ${color}`,
              cursor: "pointer",
              transition: "opacity 0.2s",
              outline:
                statusFilter === key
                  ? `2px solid ${color}`
                  : "2px solid transparent",
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
              {stats[key]}
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
              {statusFilter === key ? "Active filter" : "Click to filter"}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="users-filter-card">
        <div className="contacts-filter-grid">
          <div
            className="admin-search-wrapper"
            style={{ gridColumn: "span 2" }}
          >
            <Search size={16} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, subject, phone, or message..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="admin-input admin-input-search"
            />
          </div>
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
          </select>
          <div className="contacts-date-range">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="admin-input"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="admin-input"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedContacts.length > 0 && (
        <div className="users-bulk-bar">
          <span className="users-bulk-count">
            {selectedContacts.length} message(s) selected
          </span>
          <div className="users-bulk-actions">
            <select
              className="admin-select"
              defaultValue=""
              onChange={(e) => handleBulkStatusUpdate(e.target.value)}
            >
              <option value="" disabled>
                Change Status
              </option>
              <option value="new">Mark as New</option>
              <option value="read">Mark as Read</option>
            </select>
            <button
              className="users-bulk-btn users-bulk-blocked"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>
            <button
              className="users-bulk-btn users-bulk-clear"
              onClick={() => {
                setSelectedContacts([]);
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
                {/* Select All Checkbox */}
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
                <th
                  className="users-sortable"
                  onClick={() => requestSort("fullName")}
                >
                  Full Name
                  <SortIcon col="fullName" />
                </th>
                <th
                  className="users-sortable"
                  onClick={() => requestSort("email")}
                >
                  Email
                  <SortIcon col="email" />
                </th>
                <th>Phone</th>
                <th>Subject</th>
                <th
                  className="users-sortable"
                  onClick={() => requestSort("status")}
                >
                  Status
                  <SortIcon col="status" />
                </th>
                <th
                  className="users-sortable"
                  onClick={() => requestSort("createdAt")}
                >
                  Received
                  <SortIcon col="createdAt" />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedContacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-table-empty">
                    <Mail size={48} className="admin-table-empty-icon" />
                    <p>No messages found</p>
                  </td>
                </tr>
              ) : (
                currentContacts.map((c) => {
                  const isSelected = selectedContacts.includes(c._id);
                  return (
                    <tr
                      key={c._id}
                      style={
                        isSelected
                          ? { background: "rgba(102,126,234,0.08)" }
                          : {}
                      }
                    >
                      {/* Row Checkbox */}
                      <td>
                        <button
                          onClick={() => toggleContactSelection(c._id)}
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

                      {/* Name */}
                      <td>
                        <div className="admin-avatar-cell">
                          <div className="admin-avatar-info">
                            <p className="admin-avatar-name">{c.fullName}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <a
                          href={`mailto:${c.email}`}
                          className="contacts-email-link"
                        >
                          {c.email}
                        </a>
                      </td>

                      {/* Phone */}
                      <td className="cell-muted">
                        {c.phone ? (
                          <a
                            href={`tel:${c.phone}`}
                            className="contacts-phone-link"
                          >
                            {c.phone}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Subject */}
                      <td>
                        <span className="contacts-subject-tag">
                          {c.subject || "No subject"}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`contacts-status-badge ${c.status === "new" ? "contacts-status-new" : "contacts-status-read"}`}
                          onClick={() => toggleStatus(c._id, c.status)}
                          title="Click to toggle status"
                        >
                          {c.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td
                        className="cell-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {new Date(c.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="cell-actions">
                          <button
                            className="users-action-btn users-action-view"
                            title="View"
                            onClick={() => handleView(c)}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="users-action-btn users-action-edit"
                            title="Toggle Status"
                            onClick={() => toggleStatus(c._id, c.status)}
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button
                            className="users-action-btn users-action-delete"
                            title="Delete"
                            onClick={() => deleteContact(c._id)}
                          >
                            <Trash2 size={14} />
                          </button>
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
      {totalPages > 1 && (
        <div className="admin-pagination">
          <p className="admin-pagination-info">
            Showing {indexOfFirstContact + 1}–
            {Math.min(indexOfLastContact, filteredAndSortedContacts.length)} of{" "}
            {filteredAndSortedContacts.length}
          </p>
          <div className="admin-pagination-buttons">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`pagination-btn ${currentPage === i + 1 ? "pagination-btn-active" : ""}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* View Contact Modal */}
      {viewContact && (
        <div
          className="admin-modal-overlay"
          onClick={() => setViewContact(null)}
        >
          <div
            className="admin-modal"
            style={{ maxWidth: "42rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Contact Message</h2>
              <button
                className="admin-modal-close"
                onClick={() => setViewContact(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="contacts-view-grid">
                {[
                  ["Full Name", viewContact.fullName],
                  ["Email", viewContact.email],
                  ["Phone", viewContact.phone || "—"],
                  ["Subject", viewContact.subject || "—"],
                  ["Status", viewContact.status],
                  [
                    "Received",
                    new Date(viewContact.createdAt).toLocaleString("en-IN"),
                  ],
                ].map(([label, value]) => (
                  <div className="users-detail-row" key={label}>
                    <span className="users-detail-label">{label}</span>
                    <span className="users-detail-value">{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "1rem" }}>
                <label className="admin-form-label">Message</label>
                <div className="contacts-message-box">
                  {viewContact.message}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                className="btn-export"
                onClick={() => setViewContact(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
