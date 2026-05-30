import { useState, useEffect } from 'react';
import axios from 'axios';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('EXPENSE'); // INCOME or EXPENSE
  
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE',
    parent_id: ''
  });

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({ name: '', type: activeTab, parent_id: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      const dataToSend = {
        ...formData,
        type: activeTab, // Enforce current active tab type
        parent_id: formData.parent_id || null
      };

      if (isEditing) {
        res = await axios.put(`/api/categories/${editingId}`, dataToSend);
      } else {
        res = await axios.post('/api/categories', dataToSend);
      }

      if (res.data.success) {
        alert(res.data.message || 'Thao tác thành công!');
        fetchCategories();
        resetForm();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleEdit = (cat) => {
    setIsEditing(true);
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      type: cat.type,
      parent_id: cat.parent_id || ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        const res = await axios.delete(`/api/categories/${id}`);
        if (res.data.success) {
          alert('Xóa danh mục thành công!');
          fetchCategories();
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Không thể xóa danh mục này.');
      }
    }
  };

  // Filter categories by active tab
  const filteredCategories = categories.filter(c => c.type === activeTab);

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text)', textAlign: 'center' }}>Đang tải danh sách danh mục...</div>;
  }

  return (
    <div>
      <h1 style={{ textAlign: 'left', margin: '0 0 8px 0', fontSize: '32px', color: 'var(--text-h)', fontWeight: '800' }}>
        🏷️ Quản Lý Danh Mục
      </h1>
      <p style={{ textAlign: 'left', color: 'var(--text)', margin: '0 0 32px 0' }}>
        Tùy chỉnh danh mục chi tiêu và thu nhập để phù hợp với dòng tiền của bạn.
      </p>

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        marginBottom: '32px',
        gap: '24px'
      }}>
        <button 
          onClick={() => { setActiveTab('EXPENSE'); resetForm(); }}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            background: 'none',
            border: 'none',
            color: activeTab === 'EXPENSE' ? '#ff4d4f' : 'var(--text)',
            borderBottom: `3px solid ${activeTab === 'EXPENSE' ? '#ff4d4f' : 'transparent'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          📤 Danh Mục Chi Tiêu (Khoản Chi)
        </button>

        <button 
          onClick={() => { setActiveTab('INCOME'); resetForm(); }}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            background: 'none',
            border: 'none',
            color: activeTab === 'INCOME' ? '#52c41a' : 'var(--text)',
            borderBottom: `3px solid ${activeTab === 'INCOME' ? '#52c41a' : 'transparent'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          📥 Danh Mục Thu Nhập (Khoản Thu)
        </button>
      </div>

      {/* Form Container */}
      <div style={{
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        backgroundColor: activeTab === 'EXPENSE' ? 'rgba(255, 77, 79, 0.01)' : 'rgba(82, 196, 26, 0.01)',
        marginBottom: '40px',
        textAlign: 'left'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-h)', fontWeight: '700' }}>
          {isEditing ? `✏️ Sửa Danh Mục` : `➕ Thêm Danh Mục ${activeTab === 'EXPENSE' ? 'Chi Tiêu' : 'Thu Nhập'} Mới`}
        </h3>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'flex-end'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 250px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-h)' }}>Tên danh mục</label>
            <input 
              type="text" 
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ví dụ: Cà phê, Xăng xe, Trả nợ..."
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

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="submit"
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                background: activeTab === 'EXPENSE' ? '#ff4d4f' : '#52c41a',
                color: '#fff',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.9}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              {isEditing ? 'Lưu thay đổi' : 'Thêm danh mục'}
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

      {/* Grid of categories */}
      <div style={{ textAlign: 'left' }}>
        <h3 style={{ marginBottom: '20px', color: 'var(--text-h)', fontWeight: '700' }}>Danh Sách Danh Mục Hiện Tại</h3>
        
        {filteredCategories.length === 0 ? (
          <div style={{ padding: '40px', border: '1px dashed var(--border)', borderRadius: '16px', color: 'var(--text)', textAlign: 'center' }}>
            Chưa có danh mục nào.
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {filteredCategories.map(cat => {
              const isGlobal = cat.user_id === null;
              return (
                <div 
                  key={cat.id} 
                  style={{
                    padding: '10px 16px',
                    borderRadius: '20px',
                    border: `1px solid ${isGlobal ? 'var(--border)' : activeTab === 'EXPENSE' ? 'rgba(255, 77, 79, 0.3)' : 'rgba(82, 196, 26, 0.3)'}`,
                    background: isGlobal ? 'var(--social-bg)' : activeTab === 'EXPENSE' ? 'rgba(255, 77, 79, 0.05)' : 'rgba(82, 196, 26, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <span style={{ fontWeight: '600', color: 'var(--text-h)' }}>
                    {cat.name}
                  </span>
                  
                  {isGlobal ? (
                    <span style={{
                      fontSize: '10px',
                      color: 'var(--text)',
                      backgroundColor: 'var(--border)',
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>
                      Mặc định
                    </span>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        onClick={() => handleEdit(cat)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                          fontSize: '12px'
                        }}
                        title="Sửa danh mục"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                          fontSize: '12px'
                        }}
                        title="Xóa danh mục"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Categories;
