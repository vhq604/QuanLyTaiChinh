import { useState, useEffect } from 'react';
import axios from 'axios';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [filters, setFilters] = useState({
    type: '',
    account_id: '',
    category_id: '',
    start_date: '',
    end_date: ''
  });

  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'EXPENSE', // EXPENSE, INCOME, TRANSFER
    from_account_id: '',
    to_account_id: '',
    category_id: '',
    amount: '',
    note: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      // Build query string from filters
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) params[key] = filters[key];
      });

      const [txRes, accRes, catRes] = await Promise.all([
        axios.get('/api/transactions', { params }),
        axios.get('/api/accounts'),
        axios.get('/api/categories')
      ]);

      if (txRes.data.success) setTransactions(txRes.data.data);
      if (accRes.data.success) setAccounts(accRes.data.data.filter(a => a.is_active));
      if (catRes.data.success) setCategories(catRes.data.data);
    } catch (error) {
      console.error('Error fetching transactions page data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      type: 'EXPENSE',
      from_account_id: '',
      to_account_id: '',
      category_id: '',
      amount: '',
      note: '',
      transaction_date: new Date().toISOString().split('T')[0]
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const resetFilters = () => {
    setFilters({
      type: '',
      account_id: '',
      category_id: '',
      start_date: '',
      end_date: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      // Sanitize fields before sending
      const payload = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        note: formData.note,
        transaction_date: formData.transaction_date,
        from_account_id: formData.type === 'INCOME' ? null : parseInt(formData.from_account_id),
        to_account_id: formData.type === 'EXPENSE' ? null : parseInt(formData.to_account_id),
        category_id: formData.type === 'TRANSFER' ? null : parseInt(formData.category_id)
      };

      if (isEditing) {
        res = await axios.put(`/api/transactions/${editingId}`, payload);
      } else {
        res = await axios.post('/api/transactions', payload);
      }

      if (res.data.success) {
        alert(res.data.message || 'Giao dịch đã được lưu!');
        fetchData();
        resetForm();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleEdit = (tx) => {
    setIsEditing(true);
    setEditingId(tx.id);
    setFormData({
      type: tx.type,
      from_account_id: tx.from_account_id || '',
      to_account_id: tx.to_account_id || '',
      category_id: tx.category_id || '',
      amount: tx.amount,
      note: tx.note || '',
      transaction_date: tx.transaction_date.split('T')[0]
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này? Số dư tài khoản liên quan sẽ được tự động hoàn lại.')) {
      try {
        const res = await axios.delete(`/api/transactions/${id}`);
        if (res.data.success) {
          alert('Xóa giao dịch thành công!');
          fetchData();
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Xóa giao dịch thất bại.');
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text)', textAlign: 'center' }}>Đang tải danh sách giao dịch...</div>;
  }

  // Filter categories by selected form transaction type
  const formCategories = categories.filter(c => c.type === formData.type);

  return (
    <div>
      <h1 style={{ textAlign: 'left', margin: '0 0 8px 0', fontSize: '32px', color: 'var(--text-h)', fontWeight: '800' }}>
        💸 Quản Lý Giao Dịch
      </h1>
      <p style={{ textAlign: 'left', color: 'var(--text)', margin: '0 0 32px 0' }}>
        Quản lý các khoản thu nhập, chi tiêu hoặc chuyển tiền qua lại giữa các ví.
      </p>

      {/* Transaction Add/Edit Card */}
      <div style={{
        padding: '28px',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        backgroundColor: isEditing ? 'rgba(24, 144, 255, 0.02)' : 'rgba(170, 59, 255, 0.02)',
        marginBottom: '40px',
        textAlign: 'left'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'var(--text-h)', fontWeight: '700' }}>
          {isEditing ? `✏️ Chỉnh Sửa Giao Dịch (ID: ${editingId})` : '➕ Thêm Giao Dịch Mới'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Type Selector Tabs */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {['EXPENSE', 'INCOME', 'TRANSFER'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({ ...formData, type: t, category_id: '' })}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: `1px solid ${formData.type === t ? 'var(--accent)' : 'var(--border)'}`,
                  background: formData.type === t ? 'var(--accent-bg)' : 'transparent',
                  color: formData.type === t ? 'var(--accent)' : 'var(--text)',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {t === 'EXPENSE' ? '📤 Chi tiêu' : t === 'INCOME' ? '📥 Thu nhập' : '🔀 Chuyển khoản'}
              </button>
            ))}
          </div>

          {/* Form Fields Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {/* Account selection depending on type */}
            {formData.type !== 'INCOME' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-h)' }}>
                  Tài khoản nguồn (Rút tiền)
                </label>
                <select
                  name="from_account_id"
                  required
                  value={formData.from_account_id}
                  onChange={handleInputChange}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
                >
                  <option value="">-- Chọn tài khoản nguồn --</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({Number(acc.opening_balance).toLocaleString('vi-VN')}đ)</option>)}
                </select>
              </div>
            )}

            {formData.type !== 'EXPENSE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-h)' }}>
                  Tài khoản nhận (Nạp tiền)
                </label>
                <select
                  name="to_account_id"
                  required
                  value={formData.to_account_id}
                  onChange={handleInputChange}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
                >
                  <option value="">-- Chọn tài khoản nhận --</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({Number(acc.opening_balance).toLocaleString('vi-VN')}đ)</option>)}
                </select>
              </div>
            )}

            {/* Category selection depending on type */}
            {formData.type !== 'TRANSFER' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-h)' }}>Danh mục</label>
                <select
                  name="category_id"
                  required
                  value={formData.category_id}
                  onChange={handleInputChange}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {formCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-h)' }}>Số tiền (VND)</label>
              <input
                type="number"
                name="amount"
                required
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Nhập số tiền..."
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-h)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-h)' }}>Ngày giao dịch</label>
              <input
                type="date"
                name="transaction_date"
                required
                value={formData.transaction_date}
                onChange={handleInputChange}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-h)' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-h)' }}>Ghi chú</label>
              <input
                type="text"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Điền ghi chú (ví dụ: Ăn phở, Đi taxi, Lương freelancer...)"
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-h)', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              style={{
                padding: '12px 30px',
                borderRadius: '8px',
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {isEditing ? 'Cập Nhật Giao Dịch' : 'Lưu Giao Dịch'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                background: 'var(--border)',
                color: 'var(--text-h)',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Hủy / Đặt lại
            </button>
          </div>
        </form>
      </div>

      {/* Advanced Filters Panel */}
      <div style={{
        padding: '20px 24px',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        backgroundColor: 'rgba(0,0,0,0.01)',
        marginBottom: '32px',
        textAlign: 'left'
      }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--text-h)', fontWeight: '700' }}>
          🔍 Bộ Lọc Nâng Cao
        </h4>

        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)', flex: '1 1 120px' }}
          >
            <option value="">Tất cả loại giao dịch</option>
            <option value="EXPENSE">Chi tiêu</option>
            <option value="INCOME">Thu nhập</option>
            <option value="TRANSFER">Chuyển khoản</option>
          </select>

          <select
            name="account_id"
            value={filters.account_id}
            onChange={handleFilterChange}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)', flex: '1 1 150px' }}
          >
            <option value="">Tất cả tài khoản/ví</option>
            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
          </select>

          <select
            name="category_id"
            value={filters.category_id}
            onChange={handleFilterChange}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)', flex: '1 1 150px' }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name} ({cat.type === 'INCOME' ? 'Thu' : 'Chi'})</option>)}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)', width: '100%' }}
            />
            <span style={{ color: 'var(--text)' }}>➔</span>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)', width: '100%' }}
            />
          </div>

          <button
            onClick={resetFilters}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'none',
              color: 'var(--text-h)',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Reset bộ lọc
          </button>
        </div>
      </div>

      {/* Transactions Table List */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--code-bg)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '700' }}>Loại</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '700' }}>Ngày</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '700' }}>Danh mục / Chi tiết</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '700' }}>Ví liên quan</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '700' }}>Ghi chú</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '700', textAlign: 'right' }}>Số tiền</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-h)', fontWeight: '700', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text)' }}>
                  Không tìm thấy giao dịch nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              transactions.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.01)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor: tx.type === 'INCOME' ? 'rgba(82, 196, 26, 0.1)' : tx.type === 'EXPENSE' ? 'rgba(255, 77, 79, 0.1)' : 'rgba(24, 144, 255, 0.1)',
                      color: tx.type === 'INCOME' ? '#52c41a' : tx.type === 'EXPENSE' ? '#ff4d4f' : '#1890ff'
                    }}>
                      {tx.type === 'INCOME' ? 'Thu' : tx.type === 'EXPENSE' ? 'Chi' : 'Chuyển'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text)' }}>
                    {new Date(tx.transaction_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: '600', color: 'var(--text-h)' }}>
                    {tx.type === 'TRANSFER' ? 'Chuyển khoản nội bộ' : tx.category_name || 'Khác'}
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text)' }}>
                    {tx.type === 'INCOME' && tx.to_account_name}
                    {tx.type === 'EXPENSE' && tx.from_account_name}
                    {tx.type === 'TRANSFER' && `${tx.from_account_name} ➔ ${tx.to_account_name}`}
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text)', fontStyle: tx.note ? 'normal' : 'italic' }}>
                    {tx.note || 'Không có ghi chú'}
                  </td>
                  <td style={{
                    padding: '16px 20px',
                    textAlign: 'right',
                    fontWeight: '800',
                    color: tx.type === 'INCOME' ? '#52c41a' : tx.type === 'EXPENSE' ? '#ff4d4f' : '#1890ff'
                  }}>
                    {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : ''}
                    {Number(tx.amount).toLocaleString('vi-VN')} đ
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(tx)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(24, 144, 255, 0.1)',
                          color: '#1890ff',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '12px'
                        }}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(255, 77, 79, 0.1)',
                          color: '#ff4d4f',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '12px'
                        }}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Transactions;
