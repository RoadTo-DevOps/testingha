import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";

export default function AdminUsers() {
  const { authHeaders } = useAuth();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchUsers() {
    const res = await api.get("/api/admin/users", { headers: authHeaders });
    setUsers(res.data);
  }

  useEffect(() => {
    fetchUsers().catch((err) => {
      setError(err.response?.data?.message || "Failed to load users");
    });
  }, []);

  async function updateRole(userId, role) {
    setMessage("");
    setError("");

    try {
      await api.put(`/api/admin/users/${userId}/role`, { role }, { headers: authHeaders });
      setMessage("Cập nhật quyền thành công");
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Update role failed");
    }
  }

  return (
    <section className="admin-page">
      <div className="section-heading admin-heading">
        <div>
          <p className="eyebrow">Bảng quản trị</p>
          <h1>Quản lý người dùng</h1>
        </div>
        <p className="section-meta">Phân quyền nhanh giữa user và admin ngay trong bảng điều khiển.</p>
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="table-wrap admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Role</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="btn btn-outline" onClick={() => updateRole(user.id, "user")}>
                      Gán User
                    </button>
                    <button type="button" className="btn" onClick={() => updateRole(user.id, "admin")}>
                      Gán Admin
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
