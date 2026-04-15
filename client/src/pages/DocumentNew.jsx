import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import DynamicFormRenderer from "../components/DynamicFormRenderer.jsx";

export default function DocumentNew() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [title, setTitle] = useState("");
  const [metadata, setMetadata] = useState({});
  const [status, setStatus] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getConfig()
      .then((c) => {
        setConfig(c);
        const initial = c.statuses.find((s) => s.isInitial) || c.statuses[0];
        if (initial) setStatus(initial.key);
      })
      .catch((e) => setError(e.message));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const doc = await api.createDocument({
        title: title.trim(),
        metadata,
        status,
      });
      navigate(`/documents/${doc.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!config) return <p>Loading…</p>;

  return (
    <>
      <h1>New Document</h1>
      <form className="panel" onSubmit={onSubmit}>
        {error && <div className="error-box">{error}</div>}

        <div className="form-row">
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-row">
          <label>Initial status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {config.statuses.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

        <h3>Metadata</h3>
        <DynamicFormRenderer
          fields={config.customFields}
          values={metadata}
          onChange={(k, v) => setMetadata({ ...metadata, [k]: v })}
        />

        <div style={{ marginTop: 16 }}>
          <button className="btn" disabled={saving}>
            {saving ? "Saving…" : "Create document"}
          </button>
        </div>
      </form>
    </>
  );
}
