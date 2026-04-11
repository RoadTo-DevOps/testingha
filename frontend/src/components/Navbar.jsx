import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="brand-wrap">
        <Link to="/" className="brand">
          <span className="brand-mark">MS</span>
          <span>
            <strong>Mercato Studio</strong>
            <small>Phụ kiện công nghệ tuyển chọn</small>
          </span>
        </Link>
      </div>

      <nav className="nav-links">
        <NavLink to="/">Sản phẩm</NavLink>
        {isAdmin && <NavLink to="/admin/products">QL sản phẩm</NavLink>}
        {isAdmin && <NavLink to="/admin/users">QL người dùng</NavLink>}
      </nav>

      <div className="nav-auth">
        {isAuthenticated ? (
          <>
            <div className="welcome-card">
              <span className="welcome-label">Đã đăng nhập</span>
              <span className="welcome">{user.fullName}</span>
              <span className="welcome-role">{user.role}</span>
            </div>
            <button type="button" className="btn btn-outline" onClick={logout}>
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link className="btn btn-outline" to="/login">
              Đăng nhập
            </Link>
            <Link className="btn" to="/register">
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
