import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin/products" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-intro">
        <p className="eyebrow">Truy cập tài khoản</p>
        <h1>Đăng nhập để quản lý cửa hàng hoặc tiếp tục mua sắm.</h1>
        <p className="hero-text">
          Đăng nhập để không làm gì cả.
        </p>
        <p className="hint"></p>
      </div>

      <form onSubmit={handleSubmit} className="form-card auth-card">
        <div className="form-heading">
          <h2>Chào mừng quay lại</h2>
          <p>Sử dụng email và mật khẩu để truy cập hệ thống.</p>
        </div>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>
    </section>
  );
}
