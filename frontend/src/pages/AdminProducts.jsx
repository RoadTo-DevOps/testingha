import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";

const emptyForm = {
  id: null,
  name: "",
  description: "",
  price: "",
  stock: "",
  imageUrl: ""
};

export default function AdminProducts() {
  const { authHeaders } = useAuth();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isEditing = useMemo(() => form.id !== null, [form.id]);

  async function fetchProducts() {
    const res = await api.get("/api/products");
    setProducts(res.data);
  }

  useEffect(() => {
    fetchProducts().catch((err) => {
      setError(err.response?.data?.message || "Failed to load products");
    });
  }, []);

  function onChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function onEdit(product) {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      stock: String(product.stock),
      imageUrl: product.image_url || ""
    });
    setMessage("");
    setError("");
  }

  function onReset() {
    setForm(emptyForm);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock || 0),
      imageUrl: form.imageUrl
    };

    try {
      if (isEditing) {
        await api.put(`/api/admin/products/${form.id}`, payload, { headers: authHeaders });
        setMessage("Cập nhật sản phẩm thành công");
      } else {
        await api.post("/api/admin/products", payload, { headers: authHeaders });
        setMessage("Tạo sản phẩm thành công");
      }

      await fetchProducts();
      onReset();
    } catch (err) {
      setError(err.response?.data?.message || "Save product failed");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(productId) {
    setMessage("");
    setError("");

    try {
      await api.delete(`/api/admin/products/${productId}`, { headers: authHeaders });
      setMessage("Xóa sản phẩm thành công");
      await fetchProducts();
      if (form.id === productId) {
        onReset();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Delete product failed");
    }
  }

  return (
    <section className="admin-page">
      <div className="section-heading admin-heading">
        <div>
          <p className="eyebrow">Bảng quản trị</p>
          <h1>Quản lý sản phẩm</h1>
        </div>
        <p className="section-meta">Tạo mới, cập nhật và theo dõi tồn kho trong một trang.</p>
      </div>

      <form className="form-card admin-form-card" onSubmit={onSubmit}>
        <label>
          Tên sản phẩm
          <input name="name" value={form.name} onChange={onChange} required />
        </label>

        <label>
          Mô tả
          <textarea name="description" value={form.description} onChange={onChange} rows={3} />
        </label>

        <label>
          Gia
          <input name="price" type="number" min="0" value={form.price} onChange={onChange} required />
        </label>

        <label>
          Số lượng tồn
          <input name="stock" type="number" min="0" value={form.stock} onChange={onChange} />
        </label>

        <label>
          Image URL
          <input name="imageUrl" value={form.imageUrl} onChange={onChange} />
        </label>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <div className="row-actions">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm sản phẩm"}
          </button>
          {isEditing && (
            <button className="btn btn-outline" type="button" onClick={onReset}>
              Hủy chỉnh sửa
            </button>
          )}
        </div>
      </form>

      <div className="table-wrap admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{Number(product.price).toLocaleString("vi-VN")} VND</td>
                <td>{product.stock}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="btn btn-outline" onClick={() => onEdit(product)}>
                      Sửa
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => onDelete(product.id)}>
                      Xóa
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
