import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.getMetrics(), api.getConfig()])
      .then(([m, c]) => {
        setMetrics(m);
        setConfig(c);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error-box">{error}</div>;
  if (!metrics || !config) return <p>Loading…</p>;

  return (
    <>
      <h1>Dashboard</h1>

      <div className="row">
        <div className="card">
          <span className="label">Total documents</span>
          <span className="value">{metrics.total}</span>
        </div>
        <div className="card">
          <span className="label">Overdue</span>
          <span className="value" style={{ color: "var(--danger)" }}>
            {metrics.overdueCount}
          </span>
        </div>
        <div className="card">
          <span className="label">Warning</span>
          <span className="value" style={{ color: "var(--warn)" }}>
            {metrics.warnCount}
          </span>
        </div>
      </div>

      <div className="panel">
        <h2>By status</h2>
        <div className="row">
          {config.statuses.map((s) => (
            <div key={s.key} className="card">
              <span className="label">
                <StatusBadge statusKey={s.key} statuses={config.statuses} />
              </span>
              <span className="value">{metrics.perStatus[s.key] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Oldest open documents</h2>
        {metrics.oldestOpen.length === 0 ? (
          <p className="empty">No open documents.</p>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Title</th><th>Status</th><th>Age</th></tr>
            </thead>
            <tbody>
              {metrics.oldestOpen.map((d) => (
                <tr key={d.id}>
                  <td><Link to={`/documents/${d.id}`}>{d.title}</Link></td>
                  <td>
                    <StatusBadge statusKey={d.currentStatus} statuses={config.statuses} />
                  </td>
                  <td>{d.totalAgeDays}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {metrics.overdueDocs.length > 0 && (
        <div className="panel">
          <h2>Overdue</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>In status (days)</th>
                <th>Total age</th>
              </tr>
            </thead>
            <tbody>
              {metrics.overdueDocs.map((d) => (
                <tr key={d.id}>
                  <td><Link to={`/documents/${d.id}`}>{d.title}</Link></td>
                  <td>
                    <StatusBadge statusKey={d.currentStatus} statuses={config.statuses} />
                  </td>
                  <td style={{ color: "var(--danger)", fontWeight: 600 }}>
                    {d.timeInCurrentDays}d
                  </td>
                  <td>{d.totalAgeDays}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
