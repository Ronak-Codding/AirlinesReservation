import React from "react";
import { X, Save } from "lucide-react";
import "./AdminTables.css";
// import "./AdminUsers.css";
import "./Airlines.css";

const AirlineModal = ({
  show,
  onClose,
  onSubmit,
  form,
  setForm,
  editId,
  loading,
}) => {
  if (!show) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal admin-modal-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">
            {editId ? "Edit Airline" : "Add New Airline"}
          </h2>
          <button className="admin-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={onSubmit}>
          <div className="admin-modal-body">
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {/* Airline Name */}
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Airline Name <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter airline name"
                  value={form.airline_name}
                  onChange={(e) =>
                    setForm({ ...form, airline_name: e.target.value })
                  }
                  required
                  className="admin-input"
                />
              </div>

              {/* Airline Code */}
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Airline Code <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter airline code (e.g., AI, 6E)"
                  value={form.airline_code}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      airline_code: e.target.value.toUpperCase(),
                    })
                  }
                  required
                  maxLength={5}
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
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="admin-select"
                  style={{ width: "100%" }}
                >
                  <option value="Publish">Publish</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="admin-modal-footer">
            <button type="button" className="btn-export" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-add-user" disabled={loading}>
              {loading ? (
                <>
                  <div
                    className="users-spinner"
                    style={{ width: 16, height: 16, borderWidth: 2 }}
                  />
                  Processing...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {editId ? "Update Airline" : "Add Airline"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AirlineModal;
