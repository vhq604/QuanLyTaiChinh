# Quản Lý Tài Chính Cá Nhân (QLyTaiChinh)

Ứng dụng fullstack quản lý tài chính cá nhân: ví/tài khoản, danh mục, giao dịch và dashboard thống kê.

## Cấu trúc

- `BE/` — API Node.js + Express + MySQL
- `FE/` — React + Vite + React Router
- `DB/` — Schema và migration SQL

## Yêu cầu

- Node.js 18+
- MySQL / MariaDB

## Cài đặt

### 1. Database

```bash
mysql -u root -p < DB/finance_manager.sql
```

Nếu database đã có bảng `users` chưa có cột `password`:

```bash
mysql -u root -p finance_manager < DB/migrations/001_add_password_to_users.sql
```

### 2. Backend

```bash
cd BE
cp .env.example .env
# Chỉnh sửa .env theo cấu hình MySQL của bạn
npm install
npm run dev
```

API chạy tại `http://localhost:1006`

### 3. Frontend

```bash
cd FE
cp .env.example .env
npm install
npm run dev
```

Ứng dụng chạy tại `http://localhost:5173` (proxy `/api` → backend)

## Deploy production (miễn phí)

**Vercel** (FE) + **Render** (BE) + **Railway** (MySQL).

Hướng dẫn từng bước: **[DEPLOY.md](./DEPLOY.md)**

## Tính năng

- Đăng ký / đăng nhập (JWT)
- Quản lý ví: tiền mặt, ngân hàng, ví điện tử, tiết kiệm
- Danh mục thu/chi (mặc định + tùy chỉnh)
- Giao dịch: thu, chi, chuyển khoản + lọc
- Dashboard: số dư, thu/chi tháng, biểu đồ, phân bổ danh mục
