import { useEffect, useState } from "react";
import { api } from "../api.js";
import DocumentTable from "../components/DocumentTable.jsx";

export default function DocumentList() {
  const [docs, setDocs] = useState([]);
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.listDocuments(), api.getConfig()])
      .then(([d, c]) => {
        setDocs(d);
        setConfig(c);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error-box">{error}</div>;
  if (!config) return <p>Loading…</p>;

  return (
    <>
      <h1>Documents</h1>
      <div className="panel">
        <DocumentTable documents={docs} statuses={config.statuses} />
      </div>
    </>
  );
}
