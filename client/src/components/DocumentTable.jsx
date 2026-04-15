import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";
import AgingIndicator from "./AgingIndicator.jsx";

export default function DocumentTable({ documents, statuses }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((d) => {
      if (statusFilter && d.currentStatus !== statusFilter) return false;
      if (!q) return true;
      if (d.title.toLowerCase().includes(q)) return true;
      const meta = JSON.stringify(d.metadata || {}).toLowerCase();
      return meta.includes(q);
    });
  }, [documents, search, statusFilter]);

  return (
    <>
      <div className="toolbar">
        <input
          placeholder="Search title or metadata…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <span className="spacer" />
        <Link className="btn" to="/documents/new">+ New Document</Link>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">No documents match.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Aging</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id}>
                <td>
                  <Link to={`/documents/${d.id}`}>{d.title}</Link>
                </td>
                <td>
                  <StatusBadge statusKey={d.currentStatus} statuses={statuses} />
                </td>
                <td><AgingIndicator aging={d.aging} /></td>
                <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                <td>
                  <Link className="btn secondary small" to={`/documents/${d.id}`}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
