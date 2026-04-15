import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <nav className="nav">
        <span className="brand">InnovaPie · Audit DMS</span>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/documents">Documents</NavLink>
        <NavLink to="/documents/new">New Document</NavLink>
        <NavLink to="/settings">Admin Settings</NavLink>
        <span className="spacer" />
        <span className="user">Logged in as Admin</span>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
