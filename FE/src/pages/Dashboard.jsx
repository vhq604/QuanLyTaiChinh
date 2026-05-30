import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, txRes] = await Promise.all([
          axios.get('/api/dashboard'),
          axios.get('/api/transactions') // defaults to recent
        ]);
        
        if (dashRes.data.success) {
          setData(dashRes.data.data);
        }
        if (txRes.data.success) {
          setRecentTransactions(txRes.data.data.slice(0, 5)); // Take top 5
        }
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text)', textAlign: 'center' }}>Đang tải dữ liệu báo cáo...</div>;
  }

  const { summary, categoryDistribution, trend } = data || {
    summary: { total_balance: 0, monthly_income: 0, monthly_expense: 0 },
    categoryDistribution: [],
    trend: []
  };

  // Color Palette for categories
  const colors = ['#aa3bff', '#1890ff', '#52c41a', '#faad14', '#f5222d', '#13c2c2', '#eb2f96'];

  // SVG Trend Chart calculations
  const chartHeight = 150;
  const chartWidth = 500;
  const maxVal = Math.max(...trend.map(t => Math.max(t.income, t.expense)), 100000);

  // Generate SVG points for Polyline
  const getPoints = (type) => {
    if (trend.length === 0) return '';
    return trend.map((t, idx) => {
      const x = (idx / (trend.length - 1 || 1)) * chartWidth;
      const val = type === 'income' ? t.income : t.expense;
      const y = chartHeight - (val / maxVal) * (chartHeight - 20) - 10;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div>
      <h1 style={{ textAlign: 'left', margin: '0 0 8px 0', fontSize: '32px', color: 'var(--text-h)', fontWeight: '800' }}>
        📊 Tổng Quan Tài Chính
      </h1>
      <p style={{ textAlign: 'left', color: 'var(--text)', margin: '0 0 32px 0' }}>
        Theo dõi số dư, dòng tiền và cơ cấu chi tiêu trong tháng này.
      </p>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* Balance Card */}
        <div style={{
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          background: 'linear-gradient(135deg, rgba(170, 59, 255, 0.05), transparent)',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: '600', color: 'var(--text)' }}>Tổng Số Dư</span>
            <span style={{ fontSize: '20px' }}>💳</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '850', color: 'var(--text-h)', wordBreak: 'break-all' }}>
            {Number(summary.total_balance).toLocaleString('vi-VN')} đ
          </div>
        </div>

        {/* Income Card */}
        <div style={{
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          background: 'linear-gradient(135deg, rgba(82, 196, 26, 0.05), transparent)',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: '600', color: 'var(--text)' }}>Thu Nhập Tháng Này</span>
            <span style={{ fontSize: '20px' }}>📈</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '850', color: '#52c41a', wordBreak: 'break-all' }}>
            +{Number(summary.monthly_income).toLocaleString('vi-VN')} đ
          </div>
        </div>

        {/* Expense Card */}
        <div style={{
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          background: 'linear-gradient(135deg, rgba(255, 77, 79, 0.05), transparent)',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: '600', color: 'var(--text)' }}>Chi Tiêu Tháng Này</span>
            <span style={{ fontSize: '20px' }}>📉</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '850', color: '#ff4d4f', wordBreak: 'break-all' }}>
            -{Number(summary.monthly_expense).toLocaleString('vi-VN')} đ
          </div>
        </div>
      </div>

      {/* Visual Analytics Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* Trend Graph Card */}
        <div style={{
          padding: '28px',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch'
        }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', color: 'var(--text-h)', textAlign: 'left', fontWeight: '700' }}>
            📉 Xu Hướng Thu Chi (30 Ngày Qua)
          </h3>
          
          {trend.length === 0 ? (
            <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
              Chưa có dữ liệu dòng tiền
            </div>
          ) : (
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                {/* Horizontal grid lines */}
                <line x1="0" y1={chartHeight - 10} x2={chartWidth} y2={chartHeight - 10} stroke="var(--border)" strokeWidth="1" />
                <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="var(--border)" strokeDasharray="4 4" />
                <line x1="0" y1="10" x2={chartWidth} y2="10" stroke="var(--border)" strokeDasharray="4 4" />

                {/* Polyline for Income */}
                <polyline 
                  fill="none" 
                  stroke="#52c41a" 
                  strokeWidth="3" 
                  points={getPoints('income')} 
                />

                {/* Polyline for Expense */}
                <polyline 
                  fill="none" 
                  stroke="#ff4d4f" 
                  strokeWidth="3" 
                  points={getPoints('expense')} 
                />
              </svg>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '16px', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '4px', background: '#52c41a', borderRadius: '2px' }}></span>
                  Thu nhập
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '4px', background: '#ff4d4f', borderRadius: '2px' }}></span>
                  Chi tiêu
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Category Breakdown Card */}
        <div style={{
          padding: '28px',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
          textAlign: 'left'
        }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', color: 'var(--text-h)', fontWeight: '700' }}>
            🍕 Cơ Cấu Chi Tiêu Theo Danh Mục
          </h3>

          {categoryDistribution.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', color: 'var(--text)' }}>
              Chưa phát sinh chi tiêu trong tháng này
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {categoryDistribution.map((cat, index) => {
                const totalExpense = categoryDistribution.reduce((acc, c) => acc + c.total_amount, 0);
                const percent = ((cat.total_amount / totalExpense) * 100).toFixed(1);
                const color = colors[index % colors.length];

                return (
                  <div key={cat.category_name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-h)' }}>{cat.category_name}</span>
                      <span style={{ color: 'var(--text)' }}>
                        {Number(cat.total_amount).toLocaleString('vi-VN')} đ ({percent}%)
                      </span>
                    </div>
                    {/* Progress Bar container */}
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'var(--border)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: color,
                        borderRadius: '4px',
                        transition: 'width 0.5s ease-out'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div style={{
        padding: '28px',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        textAlign: 'left'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-h)', fontWeight: '700' }}>
            🕒 Giao Dịch Gần Đây
          </h3>
          <Link to="/transactions" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
            Xem tất cả →
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text)' }}>
            Chưa có giao dịch nào được ghi lại.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentTransactions.map((tx) => (
              <div key={tx.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 20px',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.01)',
                transition: 'transform 0.1s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    fontSize: '24px',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: tx.type === 'INCOME' ? 'rgba(82, 196, 26, 0.1)' : tx.type === 'EXPENSE' ? 'rgba(255, 77, 79, 0.1)' : 'rgba(24, 144, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {tx.type === 'INCOME' ? '📥' : tx.type === 'EXPENSE' ? '📤' : '🔀'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: 'var(--text-h)', marginBottom: '4px' }}>
                      {tx.type === 'TRANSFER' ? 'Chuyển khoản' : tx.category_name || 'Khác'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text)' }}>
                      {new Date(tx.transaction_date).toLocaleDateString('vi-VN')} {tx.note && `• ${tx.note}`}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontWeight: '800',
                    fontSize: '16px',
                    color: tx.type === 'INCOME' ? '#52c41a' : tx.type === 'EXPENSE' ? '#ff4d4f' : '#1890ff'
                  }}>
                    {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : ''}
                    {Number(tx.amount).toLocaleString('vi-VN')} đ
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text)', marginTop: '2px' }}>
                    {tx.type === 'INCOME' ? tx.to_account_name : tx.type === 'EXPENSE' ? tx.from_account_name : `${tx.from_account_name} ➔ ${tx.to_account_name}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
