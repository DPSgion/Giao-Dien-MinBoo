import { useState, useEffect, useCallback } from "react";
import adminService from "../../services/adminService";

const STATUS_MAP = {
  pending:  { label: "Đang chờ",  bg: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  resolved: { label: "Đã xử lý", bg: "rgba(16,185,129,0.15)",  color: "#34d399", border: "rgba(16,185,129,0.3)" },
  ignored:  { label: "Bỏ qua",   bg: "#1f1f2e",                color: "#6b7280", border: "#2a2a38" },
};

const REASON_LABELS = {
  spam:        "Spam",
  violence:    "Bạo lực",
  harassment:  "Quấy rối",
  nudity:      "Nội dung nhạy cảm",
  fake:        "Thông tin sai",
  other:       "Lý do khác",
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0 });
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReports = useCallback(async (status = "pending", p = 1) => {
    setLoading(true);
    try {
      // [API 12.4.1] GET /admin/reports
      const params = { page: p, limit: 15, status };
      const res = await adminService.getReports(params);
      setReports(res.data?.reports || []);
      setPagination(res.data?.pagination || { total: 0 });
    } catch (_) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReports("pending", 1); }, [fetchReports]);

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setPage(1);
    fetchReports(status, 1);
  };

  // [API 12.4.2] PATCH /admin/reports/{report_id}/status
  const handleUpdateStatus = async (reportId, newStatus) => {
    setUpdatingId(reportId);
    try {
      await adminService.updateReportStatus(reportId, newStatus);
      setReports((prev) => prev.map((r) =>
        r.report_id === reportId ? { ...r, status: newStatus } : r
      ));
    } catch (_) {} finally { setUpdatingId(null); }
  };

  const timeAgo = (d) => {
    if (!d) return "";
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-white">Báo cáo vi phạm</h2>
          <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
            <span style={{ color: "#fbbf24" }} className="font-semibold">{pagination.total}</span> báo cáo {filterStatus === "pending" ? "đang chờ" : filterStatus === "resolved" ? "đã xử lý" : "bỏ qua"}
          </p>
        </div>
        {/* Status filter */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#1a1a24", border: "1px solid #1f1f2e" }}>
          {Object.entries(STATUS_MAP).map(([val, { label }]) => (
            <button key={val} onClick={() => handleFilterChange(val)}
              className="text-xs px-4 py-2 rounded-lg font-semibold transition-all"
              style={filterStatus === val
                ? { background: val === "pending" ? "#f59e0b" : val === "resolved" ? "#10b981" : "#374151", color: "white" }
                : { color: "#6b7280" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports list */}
      <div className="space-y-3">
        {loading ? Array(5).fill(0).map((_, i) => (
          <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: "#111118", border: "1px solid #1f1f2e" }}>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: "#1f1f2e" }} />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded w-1/3" style={{ background: "#1f1f2e" }} />
                <div className="h-2 rounded w-2/3" style={{ background: "#161620" }} />
              </div>
            </div>
          </div>
        )) : reports.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ background: "#111118", border: "1px solid #1f1f2e" }}>
            <div className="text-4xl mb-3">✅</div>
            <p className="text-white font-semibold">Không có báo cáo nào</p>
            <p className="text-sm mt-1" style={{ color: "#4b5563" }}>Trạng thái: {STATUS_MAP[filterStatus]?.label}</p>
          </div>
        ) : reports.map((report) => {
          const st = STATUS_MAP[report.status] || STATUS_MAP.pending;
          return (
            <div key={report.report_id} className="rounded-2xl p-5 transition-all"
              style={{ background: "#111118", border: "1px solid #1f1f2e" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#2a2a38"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#1f1f2e"}>
              <div className="flex items-start gap-4">
                {/* Report icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "rgba(245,158,11,0.15)" }}>
                  🚨
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="text-xs font-bold" style={{ color: "#6b7280" }}>#{report.report_id}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                      style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                      {st.label}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full"
                      style={{ background: "#1a1a24", color: "#9ca3af", border: "1px solid #2a2a38" }}>
                      {REASON_LABELS[report.reason] || report.reason}
                    </span>
                    <span className="text-xs ml-auto" style={{ color: "#4b5563" }}>
                      {timeAgo(report.created_at)}
                    </span>
                  </div>

                  {/* Description */}
                  {report.description && (
                    <p className="text-sm mb-3 p-3 rounded-xl"
                      style={{ color: "#d1d5db", background: "#1a1a24", border: "1px solid #1f1f2e" }}>
                      "{report.description}"
                    </p>
                  )}

                  {/* Reporter & Post */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://ui-avatars.com/api/?name=${report.reported_by?.name || "?"}&background=7c3aed&color=fff&size=40`}
                        className="w-6 h-6 rounded-full"
                        alt=""
                      />
                      <span className="text-xs" style={{ color: "#9ca3af" }}>
                        Báo cáo bởi <span className="font-semibold text-white">{report.reported_by?.name || "Ẩn danh"}</span>
                      </span>
                    </div>
                    {report.post_id && (
                      <span className="text-xs font-mono" style={{ color: "#4b5563" }}>
                        Post: {report.post_id.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {report.status === "pending" && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      disabled={updatingId === report.report_id}
                      onClick={() => handleUpdateStatus(report.report_id, "resolved")}
                      className="text-xs font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                      style={{ background: "rgba(16,185,129,0.2)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }}>
                      ✓ Đã xử lý
                    </button>
                    <button
                      disabled={updatingId === report.report_id}
                      onClick={() => handleUpdateStatus(report.report_id, "ignored")}
                      className="text-xs font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                      style={{ background: "#1a1a24", color: "#6b7280", border: "1px solid #2a2a38" }}>
                      Bỏ qua
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.total > 15 && (
        <div className="flex justify-end gap-2">
          {[["← Trước", -1], ["Sau →", 1]].map(([label, dir]) => (
            <button key={label}
              disabled={dir === -1 ? page <= 1 : reports.length < 15}
              onClick={() => { const p = page + dir; setPage(p); fetchReports(filterStatus, p); }}
              className="text-xs px-4 py-2 rounded-xl transition-colors disabled:opacity-30"
              style={{ background: "#1a1a24", color: "#9ca3af", border: "1px solid #1f1f2e" }}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
