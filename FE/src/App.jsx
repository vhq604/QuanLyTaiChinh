import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [accounts, setAccounts] = useState([]);     // Kho chứa danh sách tài khoản
  const [categories, setCategories] = useState([]); // Kho chứa danh sách danh mục
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // State dùng chung cho cả Form Thêm và Form Sửa
  const [formData, setFormData] = useState({
    from_account_id: '',
    category_id: '',
    amount: '',
    note: '',
    transaction_date: ''
  });

  // Tự động tải tất cả dữ liệu khi mở trang
  useEffect(() => {
    const initData = async () => {
      try {
        await Promise.all([fetchExpenses(), fetchAccounts(), fetchCategories()]);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu ban đầu:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const fetchExpenses = async () => {
    const res = await axios.get('http://localhost:1006/api/transactions/expenses');
    if (res.data.success) setExpenses(res.data.data);
  };

  const fetchAccounts = async () => {
    const res = await axios.get('http://localhost:1006/api/transactions/accounts');
    if (res.data.success) setAccounts(res.data.data);
  };

  const fetchCategories = async () => {
    const res = await axios.get('http://localhost:1006/api/transactions/categories');
    if (res.data.success) setCategories(res.data.data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- THAO TÁC 1: THÊM MỚI KHOẢN CHI ---
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:1006/api/transactions/expenses', formData);
      if (res.data.success) {
        alert("Thêm khoản chi tiêu thành công!");
        fetchExpenses(); // Tải lại bảng
        resetForm();
      }
    } catch (error) {
      alert("Thêm thất bại!");
    }
  };

  // --- THAO TÁC 2: XÓA ---
  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ID: ${id}?`)) {
      const res = await axios.delete(`http://localhost:1006/api/transactions/expenses/${id}`);
      if (res.data.success) {
        alert("Xóa thành công!");
        setExpenses(expenses.filter(item => item.id !== id));
      }
    }
  };

  // --- THAO TÁC 3: SỬA ---
  const startEdit = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormData({
      from_account_id: item.from_account_id,
      category_id: item.category_id,
      amount: item.amount,
      note: item.note,
      transaction_date: item.transaction_date.split('T')[0]
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:1006/api/transactions/expenses/${editingId}`, formData);
      if (res.data.success) {
        alert("Cập nhật thành công!");
        fetchExpenses();
        setIsEditing(false);
        setEditingId(null);
        resetForm();
      }
    } catch (error) {
      alert("Cập nhật thất bại!");
    }
  };

  const resetForm = () => {
    setFormData({ from_account_id: '', category_id: '', amount: '', note: '', transaction_date: '' });
  };

  if (loading) return <div style={{ padding: '20px' }}>Đang kết nối hệ thống...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>📊 Quản Lý Tài Chính Cá Nhân</h1>
      
      {/* ➕ FORM DYNAMIC: TỰ ĐỔI GIỮA "THÊM" VÀ "SỬA" */}
      <div style={{ padding: '20px', backgroundColor: isEditing ? '#e6f7ff' : '#f6ffed', border: `1px solid ${isEditing ? '#91d5ff' : '#b7eb8f'}`, borderRadius: '8px', marginBottom: '25px' }}>
        <h3>{isEditing ? `✏️ Chỉnh sửa khoản chi (ID: ${editingId})` : '➕ Thêm khoản chi tiêu mới'}</h3>
        
        <form onSubmit={isEditing ? handleUpdateSubmit : handleCreateSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* DROPDOWN CHỌN TÀI KHOẢN */}
          <select name="from_account_id" value={formData.from_account_id} onChange={handleInputChange} required style={{ padding: '8px', borderRadius: '4px' }}>
            <option value="">-- Chọn tài khoản --</option>
            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
          </select>

          {/* DROPDOWN CHỌN DANH MỤC */}
          <select name="category_id" value={formData.category_id} onChange={handleInputChange} required style={{ padding: '8px', borderRadius: '4px' }}>
            <option value="">-- Chọn danh mục --</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>

          <input type="number" name="amount" placeholder="Số tiền (VND)" value={formData.amount} onChange={handleInputChange} required style={{ padding: '8px', borderRadius: '4px' }} />
          <input type="text" name="note" placeholder="Ghi chú (ví dụ: Ăn trưa...)" value={formData.note} onChange={handleInputChange} style={{ padding: '8px', borderRadius: '4px', width: '250px' }} />
          <input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleInputChange} required style={{ padding: '8px', borderRadius: '4px' }} />
          
          <button type="submit" style={{ backgroundColor: isEditing ? '#1890ff' : '#52c41a', color: 'white', border: 'none', padding: '8px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
            {isEditing ? 'Lưu thay đổi' : 'Thêm chi tiêu'}
          </button>
          
          {isEditing && (
            <button type="button" onClick={() => { setIsEditing(false); resetForm(); }} style={{ backgroundColor: '#d9d9d9', border: 'none', padding: '8px 20px', cursor: 'pointer', borderRadius: '4px' }}>
              Hủy
            </button>
          )}
        </form>
      </div>

      {/* 📊 BẢNG DANH SÁCH */}
      <h2>Danh Sách Giao Dịch</h2>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>ID</th>
            <th>Ngày</th>
            <th>Danh mục</th>
            <th>Tài khoản</th>
            <th>Số tiền</th>
            <th>Ghi chú</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{new Date(item.transaction_date).toLocaleDateString('vi-VN')}</td>
              <td><span style={{ backgroundColor: '#e6f7ff', padding: '4px 8px', borderRadius: '4px', color: '#1890ff' }}>{item.category_name}</span></td>
              <td>{item.account_name}</td>
              <td style={{ color: '#ff4d4f', fontWeight: 'bold' }}>-{Number(item.amount).toLocaleString('vi-VN')} đ</td>
              <td>{item.note}</td>
              <td style={{ textAlign: 'center' }}>
                <button onClick={() => startEdit(item)} style={{ backgroundColor: '#1890ff', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px', marginRight: '5px' }}>✏️ Sửa</button>
                <button onClick={() => handleDelete(item.id)} style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}>🗑️ Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;