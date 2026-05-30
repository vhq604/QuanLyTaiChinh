import { useState, useEffect } from 'react';
import axios from 'axios';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'BANK',
    opening_balance: '',
    currency: 'VND'
  });

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('/api/accounts');
      if (res.data.success) {
        setAccounts(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'BANK', opening_balance: '', currency: 'VND' });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isEditing) {
        res = await axios.put(`/api/accounts/${editingId}`, formData);
      } else {
        res = await axios.post('/api/accounts', formData);
      }

      if (res.data.success) {
        alert(res.data.message || 'Thao tác thành công!');
        fetchAccounts();
        resetForm();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleEdit = (acc) => {
    setIsEditing(true);
    setEditingId(acc.id);
    setFormData({
      name: acc.name,
      type: acc.type,
      opening_balance: acc.opening_balance,
      currency: acc.currency
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      try {
        const res = await axios.delete(`/api/accounts/${id}`);
        if (res.data.success) {
          alert(res.data.message || 'Xóa tài khoản thành công!');
          fetchAccounts();
        }
      } catch (error) {
        alert('Không thể xóa tài khoản này.');
      }
    }
  };

  // Helper icons for account types
  const getTypeDetails = (type) => {
    switch (type) {
      case 'CASH': return { icon: '💵', label: 'Tiền mặt', color: '#52c41a' };
      case 'BANK': return { icon: '🏦', label: 'Ngân hàng', color: '#1890ff' };
      case 'EWALLET': return { icon: '📱', label: 'Ví điện tử', color: '#faad14' };
      case 'SAVINGS': return { icon: '🐖', label: 'Tiết kiệm', color: '#eb2f96' };
      default: return { icon: '💳', label: 'Khác', color: 'var(--text)' };
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text)', textAlign: 'center' }}>Đang tải danh sách tài khoản...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '32px', color: 'var(--text-h)', fontWeight: '800' }}>
          💳 Quản Lý Tài Khoản / Ví
        </h1>
      </div>

      {/* Account Creation/Edit Form */}
      <div style={{
        padding: '28px',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        backgroundColor: isEditing ? 'rgba(24, 144, 255, 0.02)' : 'rgba(82, 196, 26, 0.02)',
        marginBottom: '40px',
        textAlign: 'left'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'var(--text-h)', fontWeight: '700' }}>
          {isEditing ? `✏️ Chỉnh Sửa Tài Khoản` : '➕ Thêm Tài Khoản / Ví Mới'}
        </h3>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'flex-end'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 200px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-h)' }}>Tên ví / tài khoản</label>
            <input 
              type="text" 
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ví dụ: Momo, Vietcombank..."
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-h)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 150px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-h)' }}>Loại tài khoản</label>
            <select 
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-h)',
                outline: 'none'
              }}
            >
              <option value="CASH">Tiền mặt</option>
              <option value="BANK">Ngân hàng</option>
              <option value="EWALLET">Ví điện tử</option>
              <option value="SAVINGS">Tiết kiệm</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 150px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-h)' }}>Số dư ban đầu</label>
            <input 
              type="number" 
              name="opening_balance"
              required
              value={formData.opening_balance}
              onChange={handleInputChange}
              placeholder="0"
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-h)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 100px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-h)' }}>Đơn vị tiền tệ</label>
            <select 
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-h)',
                outline: 'none'
              }}
            >
              <option value="VND">VND (đ)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="submit"
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                background: isEditing ? 'var(--accent)' : '#52c41a',
                color: '#fff',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.9}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              {isEditing ? 'Lưu thay đổi' : 'Thêm tài khoản'}
            </button>

            {isEditing && (
              <button 
                type="button"
                onClick={resetForm}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'var(--border)',
                  color: 'var(--text-h)',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Grid List of wallets */}
      {accounts.length === 0 ? (
        <div style={{ padding: '40px', border: '1px dashed var(--border)', borderRadius: '16px', color: 'var(--text)' }}>
          Chưa tạo ví/tài khoản nào. Vui lòng thêm ví ở form phía trên.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
          textAlign: 'left'
        }}>
          {accounts.map(acc => {
            const typeInfo = getTypeDetails(acc.type);
            return (
              <div key={acc.id} style={{
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
                background: acc.is_active ? 'var(--code-bg)' : 'rgba(0,0,0,0.02)',
                opacity: acc.is_active ? 1 : 0.6,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Active/Inactive Ribbon */}
                {!acc.is_active && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    color: 'var(--text)'
                  }}>
                    Ẩn / Ngừng hoạt động
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '24px' }}>{typeInfo.icon}</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '750', color: 'var(--text-h)' }}>{acc.name}</h4>
                      <span style={{ fontSize: '11px', color: typeInfo.color, fontWeight: 'bold' }}>
                        {typeInfo.label}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '24px', fontWeight: '850', color: 'var(--text-h)', marginBottom: '24px', wordBreak: 'break-all' }}>
                    {Number(acc.opening_balance).toLocaleString('vi-VN')} {acc.currency === 'VND' ? 'đ' : '$'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
                  <button 
                    onClick={() => handleEdit(acc)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      background: 'rgba(24, 144, 255, 0.1)',
                      color: '#1890ff',
                      border: 'none',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    ✏️ Sửa
                  </button>
                  <button 
                    onClick={() => handleDelete(acc.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      background: 'rgba(255, 77, 79, 0.1)',
                      color: '#ff4d4f',
                      border: 'none',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Accounts;
