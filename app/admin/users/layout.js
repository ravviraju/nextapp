export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <aside style={{ width: 200, background: "#eee" }}>
        <h3>Admin</h3>
        <ul>
          <li><a href="/admin/dashboard">Dashboard</a></li>
          <li><a href="/admin/users">Users</a></li>
        </ul>
      </aside>

      <main style={{ padding: 20 }}>
        {children}
      </main>
    </div>
  );
}
