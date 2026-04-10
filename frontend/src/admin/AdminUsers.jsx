import React, { useState, useEffect } from "react";
import {
  Edit2,
  Trash2,
  Eye,
  Plus,
  Download,
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  CheckSquare,
  Square,
} from "lucide-react";
import "./AdminTables.css";
import "./AdminUsers.css";

// ── Stats Card Config ──
const STAT_CARDS = [
  { key: "all", label: "Total Users", color: "#7F77DD" },
  { key: "active", label: "Active", color: "#22c55e" },
  { key: "blocked", label: "Blocked", color: "#E24B4A" },
];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "firstName",
    direction: "asc",
  });
  const [exportFormat, setExportFormat] = useState("csv");
  const [advancedFilters, setAdvancedFilters] = useState({ role: "" });

  // ── Stats State ──
  const [stats, setStats] = useState({ all: 0, active: 0, blocked: 0 });

  const usersPerPage = 5;

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    status: "active",
  });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000,
    );
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/user/allUsers");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      showNotification("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ── Compute stats whenever users change ──
  useEffect(() => {
    setStats({
      all: users.length,
      active: users.filter((u) => u.status === "active").length,
      blocked: users.filter((u) => u.status === "blocked").length,
    });
  }, [users]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, advancedFilters]);

  // Reset selection on page/filter change
  useEffect(() => {
    setSelectedUsers([]);
    setSelectAll(false);
  }, [currentPage, searchTerm, statusFilter, advancedFilters]);

  const filteredUsers = () => {
    return users.filter((user) => {
      const matchesSearch =
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "" || user.status === statusFilter;
      const matchesRole =
        advancedFilters.role === "" || user.role === advancedFilters.role;
      return matchesSearch && matchesStatus && matchesRole;
    });
  };

  const sortedUsers = () => {
    return [...filteredUsers()].sort((a, b) => {
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

  const filteredAndSortedUsers = sortedUsers();
  const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredAndSortedUsers.slice(
    indexOfFirstUser,
    indexOfLastUser,
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Server error");
      await loadUsers();
      showNotification("User added successfully");
      closeForm();
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditId(user._id);
    setShowForm(true);
    setFormData({
      firstName: user.firstName || "",
      middleName: user.middleName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: user.role || "user",
      status: user.status ?? "active",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/user/updateUser/${editId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      if (res.ok) {
        await loadUsers();
        showNotification("User updated successfully");
        closeForm();
      }
    } catch {
      showNotification("Failed to update user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/user/deleteUser/${id}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        setUsers(users.filter((u) => u._id !== id));
        showNotification("User deleted");
      }
    } catch {
      showNotification("Failed to delete user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/user/oneUser/${id}`);
      const data = await res.json();
      setViewUser(data);
    } catch {
      showNotification("Failed to load user details", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Checkbox handlers ──
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
      setSelectAll(false);
    } else {
      setSelectedUsers(currentUsers.map((u) => u._id));
      setSelectAll(true);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  // ── Bulk Delete ──
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedUsers.length} selected users?`))
      return;
    setLoading(true);
    try {
      await Promise.all(
        selectedUsers.map((id) =>
          fetch(`http://localhost:5000/api/user/deleteUser/${id}`, {
            method: "DELETE",
          }),
        ),
      );
      setUsers(users.filter((u) => !selectedUsers.includes(u._id)));
      setSelectedUsers([]);
      setSelectAll(false);
      showNotification(`${selectedUsers.length} users deleted`);
    } catch {
      showNotification("Failed to delete users", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Bulk Status Update ──
  const handleBulkStatusUpdate = async (newStatus) => {
    setLoading(true);
    try {
      await Promise.all(
        selectedUsers.map((id) =>
          fetch(`http://localhost:5000/api/user/updateUser/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          }),
        ),
      );
      await loadUsers();
      setSelectedUsers([]);
      setSelectAll(false);
      showNotification(`${selectedUsers.length} users updated to ${newStatus}`);
    } catch {
      showNotification("Failed to update users", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportUsers = () => {
    const dataToExport = filteredAndSortedUsers;
    if (exportFormat === "csv") {
      const headers = [
        "First Name",
        "Middle Name",
        "Last Name",
        "Username",
        "Email",
        "Phone",
        "Role",
        "Status",
      ];
      const escape = (v) => `"${v?.replace(/"/g, '""') || ""}"`;
      const csvData = dataToExport.map((u) => [
        escape(u.firstName),
        escape(u.middleName),
        escape(u.lastName),
        escape(u.username),
        escape(u.email),
        escape(u.phone),
        escape(u.role),
        escape(u.status),
      ]);
      const csv = [headers, ...csvData].map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `users_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } else {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `users_export_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    }
    showNotification(`Exported ${dataToExport.length} users`);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      role: "user",
      status: "active",
    });
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

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: "48rem" }}>
            <form onSubmit={editId ? handleUpdate : handleSubmit}>
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">
                  {editId ? "Edit User" : "Add New User"}
                </h2>
                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={closeForm}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="admin-modal-body">
                <div className="users-form-grid">
                  {[
                    { name: "firstName", label: "First Name", required: true },
                    { name: "middleName", label: "Middle Name" },
                    { name: "lastName", label: "Last Name", required: true },
                    { name: "username", label: "Username", required: true },
                    { name: "phone", label: "Phone" },
                    { name: "email", label: "Email", required: true },
                  ].map((field) => (
                    <div className="admin-form-group" key={field.name}>
                      <label className="admin-form-label">
                        {field.label}{" "}
                        {field.required && (
                          <span style={{ color: "#f87171" }}>*</span>
                        )}
                      </label>
                      <input
                        name={field.name}
                        type={field.name === "email" ? "email" : "text"}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        value={formData[field.name]}
                        onChange={handleChange}
                        disabled={field.name === "email" && editId}
                        required={field.required}
                        className="admin-input"
                      />
                    </div>
                  ))}

                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      Password{" "}
                      {!editId && <span style={{ color: "#f87171" }}>*</span>}
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                      required={!editId}
                      className="admin-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      Role <span style={{ color: "#f87171" }}>*</span>
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="admin-select"
                      style={{ width: "100%" }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      Status <span style={{ color: "#f87171" }}>*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="admin-select"
                      style={{ width: "100%" }}
                    >
                      <option value="active">Active</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-export"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-add-user"
                  disabled={loading}
                >
                  <Save size={16} />
                  {loading
                    ? "Processing..."
                    : editId
                      ? "Update User"
                      : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-sm">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">User Details</h2>
              <button
                className="admin-modal-close"
                onClick={() => setViewUser(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              {[
                ["First Name", viewUser.firstName],
                ["Middle Name", viewUser.middleName],
                ["Last Name", viewUser.lastName],
                ["Username", viewUser.username],
                ["Email", viewUser.email],
                ["Phone", viewUser.phone],
                ["Role", viewUser.role],
              ].map(([label, value]) => (
                <div className="users-detail-row" key={label}>
                  <span className="users-detail-label">{label}</span>
                  <span className="users-detail-value">{value || "—"}</span>
                </div>
              ))}
              <div className="users-detail-row">
                <span className="users-detail-label">Status</span>
                <span
                  className={`users-status-badge ${viewUser.status === "active" ? "users-status-active" : "users-status-blocked"}`}
                >
                  {viewUser.status}
                </span>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-export" onClick={() => setViewUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Users Management</h1>
          <p className="admin-page-subtitle">
            Total: <strong>{users.length}</strong> | Filtered:{" "}
            <strong>{filteredAndSortedUsers.length}</strong>
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
          <button className="btn-export" onClick={exportUsers}>
            <Download size={16} /> Export
          </button>
          <button className="btn-add-user" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add New User
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
        {STAT_CARDS.map(({ key, label, color }) => {
          const isActive =
            key === "all" ? statusFilter === "" : statusFilter === key;

          return (
            <div
              key={key}
              onClick={() => {
                setStatusFilter(key === "all" ? "" : key);
                setCurrentPage(1);
              }}
              style={{
                background: "var(--secondary, rgba(255,255,255,0.05))",
                borderRadius: "0.75rem",
                padding: "1rem 1.25rem",
                borderLeft: `3px solid ${color}`,
                cursor: "pointer",
                transition: "opacity 0.2s",
                outline: isActive
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
                {isActive ? "Active filter" : "Click to filter"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="users-filter-card">
        <div className="users-filter-grid">
          <div className="admin-search-wrapper">
            <Search size={16} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input admin-input-search"
            />
          </div>
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            className="admin-select"
            value={advancedFilters.role}
            onChange={(e) =>
              setAdvancedFilters({ ...advancedFilters, role: e.target.value })
            }
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="users-bulk-bar">
          <span className="users-bulk-count">
            {selectedUsers.length} user(s) selected
          </span>
          <div className="users-bulk-actions">
            <button
              className="users-bulk-btn users-bulk-active"
              onClick={() => handleBulkStatusUpdate("active")}
            >
              Set Active
            </button>
            <button
              className="users-bulk-btn users-bulk-blocked"
              onClick={() => handleBulkStatusUpdate("blocked")}
            >
              Set Blocked
            </button>
            <button
              className="users-bulk-btn users-bulk-delete"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>
            <button
              className="users-bulk-btn users-bulk-clear"
              onClick={() => {
                setSelectedUsers([]);
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
                <th
                  className="users-sortable"
                  onClick={() => requestSort("firstName")}
                >
                  No <SortIcon col="firstName" />
                </th>
                <th
                  className="users-sortable"
                  onClick={() => requestSort("lastName")}
                >
                  Full Name <SortIcon col="lastName" />
                </th>
                <th
                  className="users-sortable"
                  onClick={() => requestSort("email")}
                >
                  Email <SortIcon col="email" />
                </th>
                <th>Phone</th>
                <th
                  className="users-sortable"
                  onClick={() => requestSort("role")}
                >
                  Role <SortIcon col="role" />
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
              {currentUsers.length > 0 ? (
                currentUsers.map((user, i) => {
                  const isSelected = selectedUsers.includes(user._id);
                  return (
                    <tr
                      key={user._id}
                      style={
                        isSelected
                          ? { background: "rgba(102,126,234,0.08)" }
                          : {}
                      }
                    >
                      <td>
                        <button
                          onClick={() => toggleUserSelection(user._id)}
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
                      <td className="cell-muted">{indexOfFirstUser + i + 1}</td>
                      <td>
                        <div className="admin-avatar-cell">
                          <div className="admin-avatar-info">
                            <p className="admin-avatar-name">
                              {user.firstName} {user.middleName} {user.lastName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="cell-muted">{user.email}</td>
                      <td className="cell-muted">{user.phone || "—"}</td>
                      <td>
                        <span
                          className={`users-role-badge ${user.role === "admin" ? "users-role-admin" : "users-role-user"}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`users-status-badge ${user.status === "active" ? "users-status-active" : "users-status-blocked"}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div
                          className="cell-actions"
                          style={{ justifyContent: "center" }}
                        >
                          <button
                            className="users-action-btn users-action-edit"
                            title="Edit"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="users-action-btn users-action-delete"
                            title="Delete"
                            onClick={() => handleDelete(user._id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="admin-table-empty">
                    <Users size={48} className="admin-table-empty-icon" />
                    <p>No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <p className="admin-pagination-info">
            Showing {indexOfFirstUser + 1}–
            {Math.min(indexOfLastUser, filteredAndSortedUsers.length)} of{" "}
            {filteredAndSortedUsers.length}
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
    </div>
  );
};

export default AdminUsers;
