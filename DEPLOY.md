# Deploy miễn phí (Cách 1)

**Kiến trúc:** Vercel (Frontend) + Render (Backend) + Railway (MySQL)

Thứ tự deploy: **GitHub → MySQL → Backend → Frontend**

---

## 0. Đẩy code lên GitHub

```bash
git add .
git commit -m "Prepare for production deploy"
git push origin main
```

Repo phải **public** (hoặc kết nối GitHub private với Vercel/Render).

---

## 1. MySQL trên Railway

1. Đăng ký [railway.app](https://railway.app) → **New Project** → **Provision MySQL**.
2. Chọn service MySQL → tab **Variables** / **Connect**:
   - Copy **`MYSQL_URL`** hoặc **`DATABASE_URL`** (dạng `mysql://user:pass@host:port/railway`).
3. Tab **Data** hoặc dùng client (DBeaver, MySQL Workbench) kết nối và chạy file:
   - `DB/finance_manager.sql`
4. Nếu DB đã tồn tại thiếu cột `password`, chạy thêm:
   - `DB/migrations/001_add_password_to_users.sql`

**Lưu ý:** Railway MySQL thường yêu cầu SSL → trên Render đặt `DB_SSL=true`.

---

## 2. Backend trên Render

1. [render.com](https://render.com) → **New** → **Web Service** → chọn repo GitHub.
2. Cấu hình:

   | Mục | Giá trị |
   |-----|---------|
   | **Root Directory** | `BE` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Plan** | Free |

3. **Environment Variables** (Settings → Environment):

   | Key | Giá trị |
   |-----|---------|
   | `DATABASE_URL` | URL từ Railway (paste nguyên chuỗi `mysql://...`) |
   | `DB_SSL` | `true` |
   | `JWT_SECRET` | Chuỗi ngẫu nhiên dài (vd: dùng [randomkeygen](https://randomkeygen.com)) |
   | `FRONTEND_URL` | Tạm để `http://localhost:5173` — **sửa lại sau bước 3** |
   | `NODE_ENV` | `production` |

   Render tự gán `PORT` — không cần khai báo.

4. **Deploy** → đợi **Live**.
5. Kiểm tra: mở `https://TEN-SERVICE.onrender.com/health`  
   Phải thấy: `{"success":true,"message":"API is running"}`

6. Ghi lại URL API, ví dụ: `https://qlytaichinh-api.onrender.com`

**Lưu ý free tier:** Service **ngủ** sau ~15 phút không có request; lần mở đầu có thể chậm 30–60 giây.

**Blueprint (tùy chọn):** Render → **New** → **Blueprint** → chọn repo (file `render.yaml` ở root).

---

## 3. Frontend trên Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → import repo GitHub.
2. Cấu hình:

   | Mục | Giá trị |
   |-----|---------|
   | **Framework Preset** | Vite |
   | **Root Directory** | `FE` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

3. **Environment Variables** (quan trọng — gắn lúc build):

   | Key | Giá trị |
   |-----|---------|
   | `VITE_API_URL` | `https://TEN-SERVICE.onrender.com` (URL BE bước 2, **không** có `/` cuối) |

4. **Deploy** → lấy URL, ví dụ: `https://qlytaichinh.vercel.app`

5. Quay lại **Render** → service BE → **Environment**:
   - Sửa `FRONTEND_URL` = `https://qlytaichinh.vercel.app`
   - **Save** → Render tự deploy lại.

6. (Tùy chọn) Vercel preview: thêm vào `FRONTEND_URL` trên Render, cách nhau bằng dấu phẩy:
   ```
   https://qlytaichinh.vercel.app,https://qlytaichinh-xxx.vercel.app
   ```

---

## 4. Kiểm tra sau deploy

1. Mở URL Vercel → **Đăng ký** tài khoản mới.
2. Tạo ví → thêm giao dịch → xem Dashboard.
3. Nếu lỗi:
   - **Network / CORS:** kiểm tra `FRONTEND_URL` trên Render khớp domain Vercel (https, không slash cuối).
   - **401 / DB:** xem **Logs** trên Render; kiểm tra `DATABASE_URL`, đã import SQL chưa.
   - **API chậm lần đầu:** do free tier Render đang wake up — thử refresh sau ~1 phút.

---

## Biến môi trường tóm tắt

### Render (BE)

```env
DATABASE_URL=mysql://...
DB_SSL=true
JWT_SECRET=<chuỗi-bí-mật-mạnh>
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

### Vercel (FE) — chỉ khi build

```env
VITE_API_URL=https://your-api.onrender.com
```

Đổi `VITE_API_URL` → phải **Redeploy** trên Vercel (build lại).

---

## Giới hạn free tier (cần biết)

| Dịch vụ | Hạn chế |
|---------|---------|
| **Render** | Web service ngủ khi idle; cold start chậm |
| **Railway** | Credit/tháng; hết credit thì DB tạm dừng |
| **Vercel** | Hobby đủ cho dự án cá nhân / CV |

---

## Link demo cho CV

Trong README hoặc CV, ghi dạng:

> **Live demo:** https://your-app.vercel.app  
> **API:** https://your-api.onrender.com/health

Không commit file `.env` — chỉ cấu hình trên dashboard từng platform.
