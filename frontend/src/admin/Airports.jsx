import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Eye,
  Edit2,
  Trash2,
  Download,
  Search,
  Plus,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  EyeOff,
  CheckSquare,
  Square,
} from "lucide-react";
import CountrySelect from "./CountrySelect";
import "./AdminTables.css";
import "./Airlines.css";

// ── Stats Card Config ──
const STAT_CARDS = [
  { key: "all", label: "Total Airports", color: "#7F77DD" },
  { key: "publish", label: "Published", color: "#1D9E75" },
  { key: "draft", label: "Draft", color: "#EF9F27" },
];

const Airports = () => {
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const airportsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewAirport, setViewAirport] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [selectedAirports, setSelectedAirports] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "airport_name",
    direction: "asc",
  });
  const [exportFormat, setExportFormat] = useState("csv");
  const [advancedFilters, setAdvancedFilters] = useState({ country: "" });

  const [formData, setFormData] = useState({
    airport_name: "",
    city: "",
    country: "",
    airport_code: "",
    status: "Publish",
  });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000,
    );
  };

  const getToken = () => localStorage.getItem("token");

  const fetchAirports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/airports/allAirports",
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      setAirports(res.data);
    } catch {
      showNotification("Failed to fetch airports", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAirports();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter, advancedFilters]);

  // Reset selection on page/filter change
  useEffect(() => {
    setSelectedAirports([]);
    setSelectAll(false);
  }, [currentPage, searchTerm, filter, advancedFilters]);

  // ── Stats (derived from airports array) ──
  const stats = {
    all: airports.length,
    publish: airports.filter((a) => a.status?.toLowerCase() === "publish")
      .length,
    draft: airports.filter((a) => a.status?.toLowerCase() === "draft").length,
  };

  const filteredAirports = () =>
    airports.filter((a) => {
      const matchesSearch =
        a.airport_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.airport_code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filter === "all" || a.status?.toLowerCase() === filter.toLowerCase();
      const matchesCountry =
        !advancedFilters.country ||
        a.country
          ?.toLowerCase()
          .includes(advancedFilters.country.toLowerCase());
      return matchesSearch && matchesFilter && matchesCountry;
    });

  const sortedAirports = () => {
    return [...filteredAirports()].sort((a, b) => {
      let aVal = a[sortConfig.key],
        bVal = b[sortConfig.key];
      if (sortConfig.key === "createdAt" || sortConfig.key === "updatedAt") {
        return sortConfig.direction === "asc"
          ? new Date(aVal) - new Date(bVal)
          : new Date(bVal) - new Date(aVal);
      }
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

  const filteredAndSortedAirports = sortedAirports();
  const totalPages = Math.ceil(
    filteredAndSortedAirports.length / airportsPerPage,
  );
  const indexOfLast = currentPage * airportsPerPage;
  const indexOfFirst = indexOfLast - airportsPerPage;
  const currentAirports = filteredAndSortedAirports.slice(
    indexOfFirst,
    indexOfLast,
  );

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      airport_name: "",
      city: "",
      country: "",
      airport_code: "",
      status: "Publish",
    });
    setShowModal(true);
  };

  const openEditModal = (airport) => {
    setEditingId(airport._id);
    setFormData({
      airport_name: airport.airport_name,
      city: airport.city,
      country: airport.country,
      airport_code: airport.airport_code,
      status: airport.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/airports/updateAirport/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${getToken()}` } },
        );
        showNotification("Airport updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/airports", formData, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        showNotification("Airport added successfully");
      }
      setShowModal(false);
      fetchAirports();
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to save airport",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this airport?")) return;
    setLoading(true);
    try {
      await axios.delete(
        `http://localhost:5000/api/airports/deleteAirport/${id}`,
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      showNotification("Airport deleted");
      fetchAirports();
    } catch {
      showNotification("Failed to delete", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    setLoading(true);
    try {
      const newStatus = currentStatus === "Publish" ? "Draft" : "Publish";
      await axios.patch(
        `http://localhost:5000/api/airports/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      showNotification(`Status changed to ${newStatus}`);
      fetchAirports();
    } catch {
      showNotification("Failed to update status", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Checkbox handlers ──
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedAirports([]);
      setSelectAll(false);
    } else {
      setSelectedAirports(currentAirports.map((a) => a._id));
      setSelectAll(true);
    }
  };

  const toggleAirportSelection = (id) => {
    setSelectedAirports((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // ── Bulk Delete ──
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedAirports.length} airports?`)) return;
    setLoading(true);
    try {
      await Promise.all(
        selectedAirports.map((id) =>
          axios.delete(
            `http://localhost:5000/api/airports/deleteAirport/${id}`,
            { headers: { Authorization: `Bearer ${getToken()}` } },
          ),
        ),
      );
      setAirports(airports.filter((a) => !selectedAirports.includes(a._id)));
      setSelectedAirports([]);
      setSelectAll(false);
      showNotification(`${selectedAirports.length} airports deleted`);
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
        selectedAirports.map((id) =>
          axios.patch(
            `http://localhost:5000/api/airports/${id}/status`,
            { status: newStatus },
            { headers: { Authorization: `Bearer ${getToken()}` } },
          ),
        ),
      );
      await fetchAirports();
      setSelectedAirports([]);
      setSelectAll(false);
      showNotification(
        `${selectedAirports.length} airports updated to ${newStatus}`,
      );
    } catch {
      showNotification("Failed to update", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportAirports = () => {
    const dataToExport = filteredAndSortedAirports;
    if (exportFormat === "csv") {
      const headers = [
        "Airport Code",
        "Airport Name",
        "City",
        "Country",
        "Status",
        "Created Date",
      ];
      const escape = (v) => `"${v?.replace(/"/g, '""') || ""}"`;
      const csv = [
        headers,
        ...dataToExport.map((a) => [
          escape(a.airport_code),
          escape(a.airport_name),
          escape(a.city),
          escape(a.country),
          escape(a.status),
          escape(new Date(a.createdAt).toLocaleDateString()),
        ]),
      ]
        .map((r) => r.join(","))
        .join("\n");
      const el = document.createElement("a");
      el.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      el.download = `airports_export_${new Date().toISOString().split("T")[0]}.csv`;
      el.click();
    } else {
      const el = document.createElement("a");
      el.href = URL.createObjectURL(
        new Blob([JSON.stringify(dataToExport, null, 2)], {
          type: "application/json",
        }),
      );
      el.download = `airports_export_${new Date().toISOString().split("T")[0]}.json`;
      el.click();
    }
    showNotification(`Exported ${dataToExport.length} airports`);
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

      {/* View Airport Modal */}
      {viewAirport && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-sm">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Airport Details</h2>
              <button
                className="admin-modal-close"
                onClick={() => setViewAirport(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              {[
                ["Airport Code", viewAirport.airport_code],
                ["Airport Name", viewAirport.airport_name],
                ["City", viewAirport.city],
                ["Country", viewAirport.country],
                ["Status", viewAirport.status],
                ...(viewAirport.createdAt
                  ? [
                      [
                        "Created",
                        new Date(viewAirport.createdAt).toLocaleDateString(
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
                onClick={() => setViewAirport(null)}
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
          <h1 className="admin-page-title">Airports Management</h1>
          <p className="admin-page-subtitle">
            Total: <strong>{airports.length}</strong> | Filtered:{" "}
            <strong>{filteredAndSortedAirports.length}</strong>
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
          <button className="btn-export" onClick={exportAirports}>
            <Download size={16} /> Export
          </button>
          <button className="btn-add-user" onClick={openAddModal}>
            <Plus size={16} /> Add Airport
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
              setFilter(key);
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
                filter === key ? `2px solid ${color}` : "2px solid transparent",
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
              {filter === key ? "Active filter" : "Click to filter"}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="users-filter-card">
        <div className="airports-filter-grid">
          <div className="admin-search-wrapper">
            <Search size={16} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search by name, city, country, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input admin-input-search"
            />
          </div>
          <select
            className="admin-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="publish">Published</option>
            <option value="draft">Draft</option>
          </select>
          <input
            type="text"
            placeholder="Filter by country..."
            value={advancedFilters.country}
            onChange={(e) =>
              setAdvancedFilters({
                ...advancedFilters,
                country: e.target.value,
              })
            }
            className="admin-input"
          />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedAirports.length > 0 && (
        <div className="users-bulk-bar">
          <span className="users-bulk-count">
            {selectedAirports.length} airport(s) selected
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
                setSelectedAirports([]);
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
                  onClick={() => requestSort("airport_code")}
                >
                  Code <SortIcon col="airport_code" />
                </th>
                <th
                  className="users-sortable"
                  onClick={() => requestSort("airport_name")}
                >
                  Airport Name <SortIcon col="airport_name" />
                </th>
                <th
                  className="users-sortable"
                  onClick={() => requestSort("city")}
                >
                  City <SortIcon col="city" />
                </th>
                <th
                  className="users-sortable"
                  onClick={() => requestSort("country")}
                >
                  Country <SortIcon col="country" />
                </th>
                <th
                  className="users-sortable"
                  onClick={() => requestSort("status")}
                >
                  Status <SortIcon col="status" />
                </th>
                <th
                  className="users-sortable"
                  onClick={() => requestSort("createdAt")}
                >
                  Created <SortIcon col="createdAt" />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentAirports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-table-empty">
                    <MapPin size={48} className="admin-table-empty-icon" />
                    <p>No airports found</p>
                    <button
                      className="btn-primary"
                      style={{ marginTop: "1rem" }}
                      onClick={openAddModal}
                    >
                      <Plus size={16} /> Add Your First Airport
                    </button>
                  </td>
                </tr>
              ) : (
                currentAirports.map((airport) => {
                  const isSelected = selectedAirports.includes(airport._id);
                  return (
                    <tr
                      key={airport._id}
                      style={
                        isSelected
                          ? { background: "rgba(102,126,234,0.08)" }
                          : {}
                      }
                    >
                      {/* Row Checkbox */}
                      <td>
                        <button
                          onClick={() => toggleAirportSelection(airport._id)}
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

                      {/* Code */}
                      <td>
                        <span className="airline-code-tag">
                          {airport.airport_code}
                        </span>
                      </td>

                      {/* Name */}
                      <td>
                        <div className="admin-avatar-cell">
                          <div className="admin-avatar-info">
                            <p className="admin-avatar-name">
                              {airport.airport_name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* City */}
                      <td className="cell-muted">{airport.city}</td>

                      {/* Country */}
                      <td className="cell-muted">{airport.country}</td>

                      {/* Status */}
                      <td>
                        <span
                          className={`users-status-badge ${airport.status === "Publish" ? "airline-status-publish" : "airline-status-draft"}`}
                        >
                          {airport.status}
                        </span>
                      </td>

                      {/* Created */}
                      <td
                        className="cell-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {new Date(airport.createdAt).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="cell-actions">
                          <button
                            className="users-action-btn users-action-edit"
                            title="Edit"
                            onClick={() => openEditModal(airport)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            title={
                              airport.status === "Publish"
                                ? "Set Draft"
                                : "Set Publish"
                            }
                            onClick={() =>
                              toggleStatus(airport._id, airport.status)
                            }
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: "0.5rem",
                              border: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "background 0.2s",
                              background:
                                airport.status === "Publish"
                                  ? "rgba(167,139,250,0.1)"
                                  : "rgba(16,185,129,0.1)",
                              color:
                                airport.status === "Publish"
                                  ? "#a78bfa"
                                  : "#10b981",
                            }}
                          >
                            {airport.status === "Publish" ? (
                              <EyeOff size={14} />
                            ) : (
                              <Eye size={14} />
                            )}
                          </button>
                          <button
                            className="users-action-btn users-action-delete"
                            title="Delete"
                            onClick={() => handleDelete(airport._id)}
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
            {Math.min(indexOfLast, filteredAndSortedAirports.length)} of{" "}
            {filteredAndSortedAirports.length}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="admin-modal"
            style={{ maxWidth: "36rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingId ? "Edit Airport" : "Add New Airport"}
              </h2>
              <button
                className="admin-modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-modal-grid">
                  {/* Airport Code */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      Airport Code <span style={{ color: "#f87171" }}>*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      required
                      value={formData.airport_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          airport_code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="e.g., BOM"
                      className="admin-input"
                      style={{ textTransform: "uppercase" }}
                    />
                  </div>

                  {/* Status */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      Status <span style={{ color: "#f87171" }}>*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="admin-select"
                      style={{ width: "100%" }}
                    >
                      <option value="Publish">Publish</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>

                  {/* Airport Name */}
                  <div
                    className="admin-form-group"
                    style={{ gridColumn: "span 2" }}
                  >
                    <label className="admin-form-label">
                      Airport Name <span style={{ color: "#f87171" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.airport_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          airport_name: e.target.value,
                        })
                      }
                      placeholder="e.g., Chhatrapati Shivaji Maharaj International Airport"
                      className="admin-input"
                    />
                  </div>

                  {/* City */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      City <span style={{ color: "#f87171" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="e.g., Mumbai"
                      className="admin-input"
                    />
                  </div>

                  {/* Country */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      Country <span style={{ color: "#f87171" }}>*</span>
                    </label>
                    <CountrySelect
                      value={formData.country}
                      onChange={(country) =>
                        setFormData({ ...formData, country })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-export"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-add-user"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div
                        className="users-spinner"
                        style={{ width: 16, height: 16, borderWidth: 2 }}
                      />{" "}
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingId ? "Update Airport" : "Add Airport"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Airports;
