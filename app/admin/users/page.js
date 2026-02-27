"use client";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setListLoading(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        alert(data.message || "Failed to load users");
      }
    } catch (err) {
      console.error("Error fetching users", err);
      alert("Error fetching users");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        alert("User created successfully");
        setEmail("");
        setPassword("");
        fetchUsers();
      } else {
        alert(data.message || "Failed to create user");
      }
    } catch (err) {
      console.error("Error creating user", err);
      alert("Error creating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Create New Admin User</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <input
            type="email"
            placeholder="Email"
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleCreateUser}
            disabled={loading}
            className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed w-full"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>

      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Users</h2>
          <button
            onClick={fetchUsers}
            disabled={listLoading}
            className="text-sm bg-gray-100 px-3 py-2 rounded-md border hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {listLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {users.length === 0 ? (
          <p className="text-gray-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border-b text-left">Email</th>
                  <th className="px-4 py-2 border-b text-left">Role</th>
                  <th className="px-4 py-2 border-b text-left">Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-4 py-2 border-b">{user.email}</td>
                    <td className="px-4 py-2 border-b">{user.role}</td>
                    <td className="px-4 py-2 border-b">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

