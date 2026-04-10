import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Edit2,
  Trash2,
  Download,
  Search,
  Plus,
  Plane,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
} from "lucide-react";
import AirlineModal from "./AirlineModal";
import "./AdminTables.css";
import "./Airlines.css";

// ── Stats Card Config ──
const STAT_CARDS = [
  { key: "All", label: "Total Airlines", color: "#7F77DD" },
  { key: "Publish", label: "Published", color: "#1D9E75" },
  { key: "Draft", label: "Draft", color: "#EF9F27" },
];

const Airlines = () => {
  const [airlines, setAirlines] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const airlinesPerPage = 5;
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewAirline, setViewAirline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "airline_name",
    direction: "asc",
  });
  const [exportFormat, setExportFormat] = useState("csv");

  const [form, setForm] = useState({
    airline_name: "",
    airline_code: "",
    status: "Publish",
  });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000,
    );
  };

  const fetchAirlines = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/airlines/allAirlines",
      );
      setAirlines(res.data.airlines || []);
    } catch {
      showNotification("Failed to load airlines", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAirlines();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Reset selection on page/filter change
  useEffect(() => {
    setSelectedAirlines([]);
    setSelectAll(false);
  }, [currentPage, search, statusFilter]);

  // ── Stats (derived from airlines array) ──
  const stats = {
    All: airlines.length,
    Publish: airlines.filter((a) => a.status === "Publish").length,
    Draft: airlines.filter((a) => a.status === "Draft").length,
  };

  const filteredAirlines = () =>
    airlines.filter((a) => {
      const matchesSearch =
        a.airline_name?.toLowerCase().includes(search.toLowerCase()) ||
        a.airline_code?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  const sortedAirlines = () => {
    return [...filteredAirlines()].sort((a, b) => {
      const aVal = a[sortConfig.key],
        bVal = b[sortConfig.key];
      if (typeof aVal === "string")
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    });
  };

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredAndSortedAirlines = sortedAirlines();
  const totalPages = Math.ceil(
    filteredAndSortedAirlines.length / airlinesPerPage,
  );
  const indexOfLast = currentPage * airlinesPerPage;
  const indexOfFirst = indexOfLast - airlinesPerPage;
  const currentAirlines = filteredAndSortedAirlines.slice(
    indexOfFirst,
    indexOfLast,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await axios.put(
          `http://localhost:5000/api/airlines/updateAirline/${editId}`,
          form,
        );
        showNotification("Airline updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/airlines", form);
        showNotification("Airline added successfully");
      }
      setShowModal(false);
      setEditId(null);
      setForm({ airline_name: "", airline_code: "", status: "Publish" });
      fetchAirlines();
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Operation failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (airline) => {
    setForm({
      airline_name: airline.airline_name,
      airline_code: airline.airline_code,
      status: airline.status,
    });
    setEditId(airline._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this airline?")) return;
    setLoading(true);
    try {
      await axios.delete(
        `http://localhost:5000/api/airlines/deleteAirline/${id}`,
      );
      showNotification("Airline deleted");
      fetchAirlines();
    } catch {
      showNotification("Failed to delete", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Checkbox handlers ──
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedAirlines([]);
      setSelectAll(false);
    } else {
      setSelectedAirlines(currentAirlines.map((a) => a._id));
      setSelectAll(true);
    }
  };

  const toggleAirlineSelection = (id) => {
    setSelectedAirlines((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // ── Bulk Delete ──
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedAirlines.length} airlines?`)) return;
    setLoading(true);
    try {
      await Promise.all(
        selectedAirlines.map((id) =>
          axios.delete(
            `http://localhost:5000/api/airlines/deleteAirline/${id}`,
          ),
        ),
      );
      setAirlines(airlines.filter((a) => !selectedAirlines.includes(a._id)));
      setSelectedAirlines([]);
      setSelectAll(false);
      showNotification(`${selectedAirlines.length} airlines deleted`);
    } catch {
      showNotification("Failed to delete", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Bulk Status Update ──
  const handleBulkStatusUpdate = async (newStatus) => {
    setLoading(true);
    try {
      await Promise.all(
        selectedAirlines.map((id) =>
          axios.put(`http://localhost:5000/api/airlines/updateAirline/${id}`, {
            status: newStatus,
          }),
        ),
      );
      await fetchAirlines();
      setSelectedAirlines([]);
      setSelectAll(false);
      showNotification(
        `${selectedAirlines.length} airlines updated to ${newStatus}`,
      );
    } catch {
      showNotification("Failed to update", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportAirlines = () => {
    const dataToExport = filteredAndSortedAirlines;
    if (exportFormat === "csv") {
      const headers = ["Airline Name", "Airline Code", "Status"];
      const escape = (v) => `"${v?.replace(/"/g, '""') || ""}"`;
      const csv = [
        headers,
        ...dataToExport.map((a) => [
          escape(a.airline_name),
          escape(a.airline_code),
          escape(a.status),
        ]),
      ]
        .map((r) => r.join(","))
        .join("\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      a.download = `airlines_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } else {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(
        new Blob([JSON.stringify(dataToExport, null, 2)], {
          type: "application/json",
        }),
      );
      a.download = `airlines_export_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    }
    showNotification(`Exported ${dataToExport.length} airlines`);
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
            <p>Loading...</p>
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

      {/* View Airline Modal */}
      {viewAirline && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-sm">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Airline Details</h2>
              <button
                className="admin-modal-close"
                onClick={() => setViewAirline(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              {[
                ["Airline Name", viewAirline.airline_name],
                ["Airline Code", viewAirline.airline_code],
                ["Status", viewAirline.status],
                ...(viewAirline.createdAt
                  ? [
                      [
                        "Created",
                        new Date(viewAirline.createdAt).toLocaleDateString(
                          "en-IN",
                        ),
                      ],
                    ]
                  : []),
              ].map(([label, value]) => (
                <div className="users-detail-row" key={label}>
                  <span className="users-detail-label">{label}</span>
                  <span className="users-detail-value">{value || "—"}</span>
                </div>
              ))}
            </div>
            <div className="admin-modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setViewAirline(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Airlines Management</h1>
          <p className="admin-page-subtitle">
            Total: <strong>{airlines.length}</strong> | Filtered:{" "}
            <strong>{filteredAndSortedAirlines.length}</strong>
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
          <button className="btn-export" onClick={exportAirlines}>
            <Download size={16} /> Export
          </button>
          <button
            className="btn-add-user"
            onClick={() => {
              setShowModal(true);
              setEditId(null);
              setForm({
                airline_name: "",
                airline_code: "",
                status: "Publish",
              });
            }}
          >
            <Plus size={16} /> Add Airline
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
            key={key}
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
        <div className="users-filter-grid">
          <div className="admin-search-wrapper">
            <Search size={16} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search airline by name or code..."
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
            <option value="All">All Status</option>
            <option value="Publish">Publish</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedAirlines.length > 0 && (
        <div className="users-bulk-bar">
          <span className="users-bulk-count">
            {selectedAirlines.length} airline(s) selected
          </span>
          <div className="users-bulk-actions">
            <button
              className="users-bulk-btn users-bulk-active"
              onClick={() => handleBulkStatusUpdate("Publish")}
            >
              Set Publish
            </button>
            <button
              className="users-bulk-btn users-bulk-clear"
              onClick={() => handleBulkStatusUpdate("Draft")}
            >
              Set Draft
            </button>
            <button
              className="users-bulk-btn users-bulk-blocked"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>
            <button
              className="users-bulk-btn users-bulk-clear"
              onClick={() => {
                setSelectedAirlines([]);
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
                  onClick={() => requestSort("airline_name")}
                >
                  Name <SortIcon col="airline_name" />
                </th>
                <th
                  className="users-sortable"
                  onClick={() => requestSort("airline_code")}
                >
                  Code <SortIcon col="airline_code" />
                </th>
                <th
                  className="users-sortable"
                  onClick={() => requestSort("status")}
                >
                  Status <SortIcon col="status" />
                </th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentAirlines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-table-empty">
                    <Plane size={48} className="admin-table-empty-icon" />
                    <p>No airlines found</p>
                  </td>
                </tr>
              ) : (
                currentAirlines.map((airline) => {
                  const isSelected = selectedAirlines.includes(airline._id);
                  return (
                    <tr
                      key={airline._id}
                      style={
                        isSelected
                          ? { background: "rgba(102,126,234,0.08)" }
                          : {}
                      }
                    >
                      {/* Row Checkbox */}
                      <td>
                        <button
                          onClick={() => toggleAirlineSelection(airline._id)}
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
                            <p className="admin-avatar-name">
                              {airline.airline_name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td>
                        <span className="airline-code-tag">
                          {airline.airline_code}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`users-status-badge ${airline.status === "Publish" ? "airline-status-publish" : "airline-status-draft"}`}
                        >
                          {airline.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div
                          className="cell-actions"
                          style={{ justifyContent: "center" }}
                        >
                          <button
                            className="users-action-btn users-action-edit"
                            title="Edit"
                            onClick={() => handleEdit(airline)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="users-action-btn users-action-delete"
                            title="Delete"
                            onClick={() => handleDelete(airline._id)}
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
            Showing {indexOfFirst + 1}–
            {Math.min(indexOfLast, filteredAndSortedAirlines.length)} of{" "}
            {filteredAndSortedAirlines.length}
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

      {/* Airline Modal */}
      <AirlineModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditId(null);
          setForm({ airline_name: "", airline_code: "", status: "Publish" });
        }}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        editId={editId}
        loading={loading}
      />
    </div>
  );
};

export default Airlines;
