import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import AgingIndicator from "../components/AgingIndicator.jsx";
import DynamicFormRenderer from "../components/DynamicFormRenderer.jsx";

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [config, setConfig] = useState(null);
  const [title, setTitle] = useState("");
  const [metadata, setMetadata] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.getDocument(id), api.getConfig()])
      .then(([d, c]) => {
        setDoc(d);
        setConfig(c);
        setTitle(d.title);
        setMetadata(d.metadata || {});
      })
      .catch((e) => setError(e.message));
  }, [id]);

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateDocument(id, { title, metadata });
      setDoc(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function onChangeStatus(newKey) {
    if (!newKey || newKey === doc.currentStatus) return;
    setError(null);
    try {
      const updated = await api.changeStatus(id, newKey);
      setDoc(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDelete() {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    try {
      await api.deleteDocument(id);
      navigate("/documents");
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !doc) return <div className="error-box">{error}</div>;
  if (!doc || !config) return <p>Loading…</p>;

  return (
    <>
      <h1>
        {doc.title}{" "}
        <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 14 }}>
          #{doc.id}
        </span>
      </h1>

      {error && <div className="error-box">{error}</div>}

      <div className="panel">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <StatusBadge statusKey={doc.currentStatus} statuses={config.statuses} />
          <AgingIndicator aging={doc.aging} />
          <span className="spacer" style={{ flex: 1 }} />
          <select
            value={doc.currentStatus}
            onChange={(e) => onChangeStatus(e.target.value)}
            style={{ maxWidth: 220 }}
          >
            {config.statuses.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="panel">
        <h2>Details</h2>
        <div className="form-row">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <DynamicFormRenderer
          fields={config.customFields}
          values={metadata}
          onChange={(k, v) => setMetadata({ ...metadata, [k]: v })}
        />
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button className="btn" onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          <Link className="btn secondary" to="/documents">Back</Link>
          <span style={{ flex: 1 }} />
          <button className="btn danger" onClick={onDelete}>Delete</button>
        </div>
      </div>

      <div className="panel">
        <h2>Aging breakdown</h2>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Total age: <strong>{doc.aging.totalAgeDays}d</strong> · In current status:{" "}
          <strong>{doc.aging.timeInCurrentDays}d</strong>
        </p>
        {renderPerStatusBars(doc.aging.timePerStatus, config.statuses)}
      </div>

      <div className="panel">
        <h2>Status history</h2>
        <div className="timeline">
          {doc.history.map((h) => (
            <div key={h.id} className="event">
              <StatusBadge statusKey={h.status} statuses={config.statuses} />
              <div className="ts">{new Date(h.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function renderPerStatusBars(timePerStatus, statuses) {
  const entries = Object.entries(timePerStatus);
  if (entries.length === 0) return <p className="empty">No status history.</p>;
  const max = Math.max(...entries.map(([, ms]) => ms), 1);
  const DAY = 24 * 60 * 60 * 1000;
  return (
    <div>
      {entries.map(([key, ms]) => {
        const def = statuses.find((s) => s.key === key);
        const color = def ? def.color : "#9ca3af";
        const label = def ? def.label : key;
        const days = Math.floor(ms / DAY);
        const hours = Math.floor((ms % DAY) / (60 * 60 * 1000));
        return (
          <div key={key} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{label}</span>
              <span style={{ color: "var(--muted)" }}>{days}d {hours}h</span>
            </div>
            <div className="bar">
              <span style={{ width: `${(ms / max) * 100}%`, background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
