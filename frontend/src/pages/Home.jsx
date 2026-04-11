import { useEffect, useState } from "react";
import api from "../api";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await api.get("/api/products");
        setProducts(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) return <p className="status-card">Đang tải sản phẩm...</p>;
  if (error) return <p className="status-card error">{error}</p>;

  return (
    <section className="home-page">
      <div className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Cửa hàng hiện đại</p>
          <h1>Đồ công nghệ đẹp, gọn và sẵn sàng giao ngay.</h1>
          <p className="hero-text">
            Chọn từ bộ sưu tập phụ kiện desktop, audio và setup essentials theo phong cách tối giản.
          </p>
          <div className="hero-metrics">
            <div>
              <strong>{products.length}</strong>
              <span>sản phẩm đang bán</span>
            </div>
            <div>
              <strong>24h</strong>
              <span>xử lý đơn nội thành</span>
            </div>
            <div>
              <strong>Admin</strong>
              <span>quản lý tồn kho trực tiếp</span>
            </div>
          </div>
        </div>
        <div className="hero-aside">
          <div className="hero-note">
            <span>Flow chính</span>
            <p>Khách xem sản phẩm, đăng ký, đăng nhập. Nhưng chưa mua được nhé cảm ơn mọi người tốn 10s đọc</p>
          </div>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <p className="eyebrow">Danh mục</p>
          <h2>Danh sách sản phẩm</h2>
        </div>
        <p className="section-meta">API bắn biu biu để lấy data.</p>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product.id}>
            <div className="product-media">
              <img
                src={product.image_url || "https://picsum.photos/seed/default/400/300"}
                alt={product.name}
                className="card-image"
              />
              <span className="stock-pill">Còn lại {product.stock}</span>
            </div>
            <div className="product-body">
              <div className="product-topline">
                <span className="product-id">#{product.id}</span>
                <span className="product-price">{Number(product.price).toLocaleString("vi-VN")} VND</span>
              </div>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
