import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);
      await register(fullName, email, password);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-intro">
        <p className="eyebrow">Thành viên mới</p>
        <h1>Tạo tài khoản để theo dõi sản phẩm và mua hàng nhanh hơn.</h1>
        <p className="hero-text">
          Quy trình đăng ký tối giản, sau đó bạn có thể đăng nhập ngay và tiếp tục khám phá catalog.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="form-card auth-card">
        <div className="form-heading">
          <h2>Tạo tài khoản</h2>
          <p>Nhập thông tin cơ bản để tạo tài khoản user.</p>
        </div>

        <label>
          Họ tên
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </label>

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
            minLength={6}
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : "Tạo tài khoản"}
        </button>
      </form>
    </section>
  );
}
