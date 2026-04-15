import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DocumentList from "./pages/DocumentList.jsx";
import DocumentDetail from "./pages/DocumentDetail.jsx";
import DocumentNew from "./pages/DocumentNew.jsx";
import AdminSettings from "./pages/AdminSettings.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/documents" element={<DocumentList />} />
        <Route path="/documents/new" element={<DocumentNew />} />
        <Route path="/documents/:id" element={<DocumentDetail />} />
        <Route path="/settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
