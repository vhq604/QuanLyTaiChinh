# AGENTS.md

## Project Overview

Tên dự án: Quản Lý Tài Chính Cá Nhân (QLyTaiChinh)

Mục tiêu:

- Thay thế việc quản lý tài chính trên Notion.
- Xây dựng một dự án cá nhân nghiêm túc để đưa vào CV.
- Thực hành Fullstack với React, NodeJS và MySQL.
- Làm nền tảng để tích hợp AI trong tương lai.

---

## Tech Stack

### Frontend

- React
- Axios
- React Router

### Backend

- NodeJS
- Express
- MySQL
- mysql2
- dotenv
- cors

### Database

- MySQL
- Database schema được quản lý bằng file SQL.

---

## Project Structure

```text
QLyTaiChinh/
│
├── Backend/
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── app.js
│   │
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── Frontend/
│
└── Database/
    └── finance_manager.sql
```

---

## Architecture

API phải tuân theo luồng:

```text
Frontend
    ↓
Route
    ↓
Controller
    ↓
Model
    ↓
Database
```

### Route

Nhiệm vụ:

- Định nghĩa endpoint.
- Mapping request tới controller.

Không chứa business logic.

### Controller

Nhiệm vụ:

- Nhận request.
- Validate dữ liệu.
- Gọi model.
- Trả response.

Controller KHÔNG được chứa SQL.

### Model

Nhiệm vụ:

- Thực hiện truy vấn database.
- Chứa toàn bộ câu lệnh SQL.

Model KHÔNG xử lý request hoặc response.

---

## Coding Rules

### Async/Await

Luôn ưu tiên:

```js
async/await
```

Không sử dụng callback style nếu không cần thiết.

---

### Response Format

Response thành công:

```json
{
  "success": true,
  "data": {}
}
```

Response lỗi:

```json
{
  "success": false,
  "message": "Error message"
}
```

---

### SQL Placement

Đúng:

```text
Controller
    ↓
Model chứa SQL
```

Sai:

```text
Controller chứa SQL trực tiếp
```

---

### Naming Convention

Tables:

```text
snake_case
```

Ví dụ:

```text
transactions
categories
accounts
budgets
```

API:

```text
/api/accounts
/api/categories
/api/transactions
```

Biến Javascript:

```js
camelCase
```

---

## Core Features

### 1. Accounts (Ví/Tài khoản)

Cho phép:

- Tạo ví
- Sửa ví
- Xóa ví
- Xem danh sách ví

Ví dụ:

- Tiền mặt
- Momo
- Ngân hàng

---

### 2. Categories

Cho phép:

- Quản lý danh mục thu
- Quản lý danh mục chi

Ví dụ:

Chi:

- Ăn uống
- Đi lại
- Giải trí

Thu:

- Lương
- Thưởng
- Freelance

---

### 3. Transactions

Cho phép:

- Thêm giao dịch
- Sửa giao dịch
- Xóa giao dịch
- Lọc giao dịch

Thông tin cơ bản:

- Loại giao dịch
- Số tiền
- Danh mục
- Ví
- Ngày giao dịch
- Ghi chú

---

### 4. Dashboard

Thống kê:

- Tổng thu
- Tổng chi
- Số dư hiện tại
- Chi tiêu theo danh mục
- Thu nhập theo thời gian

---

## Development Priority

Ưu tiên theo thứ tự:

1. Database
2. Backend API
3. Frontend CRUD
4. Dashboard
5. Authentication (nếu cần)
6. AI Features

Không triển khai AI khi CRUD cơ bản chưa hoàn thiện.

---

## Future AI Features

### Natural Language Transaction Input

Người dùng nhập:

```text
Ăn cơm tấm 45k
```

AI phân tích:

```json
{
  "type": "expense",
  "amount": 45000,
  "category": "Ăn uống",
  "description": "Ăn cơm tấm"
}
```

---

### Spending Analysis

Người dùng hỏi:

```text
Tháng này tôi tiêu nhiều nhất vào đâu?
```

AI phân tích dữ liệu giao dịch và trả lời.

---

### Financial Assistant

Người dùng hỏi:

```text
Tôi muốn mua laptop 25 triệu.
```

AI dựa trên dữ liệu tài chính để đưa ra gợi ý.

---

## Expectations For AI Coding Agents

Khi tạo code:

- Tuân thủ cấu trúc thư mục hiện tại.
- Không đưa SQL vào Controller.
- Không thay đổi kiến trúc nếu chưa được yêu cầu.
- Ưu tiên code đơn giản, dễ hiểu.
- Ưu tiên maintainability hơn tối ưu hóa sớm.
- Mỗi chức năng nên được tách Route, Controller và Model rõ ràng.

Khi đề xuất tính năng mới:

- Ưu tiên giá trị thực tế.
- Tránh thêm AI chỉ để "cho có".
- Tính năng phải hỗ trợ quản lý tài chính cá nhân.

---

## Long-Term Vision

Dự án không chỉ là bài tập CRUD.

Mục tiêu là phát triển thành một ứng dụng quản lý tài chính cá nhân có khả năng:

- Theo dõi dòng tiền.
- Phân tích hành vi chi tiêu.
- Đưa ra khuyến nghị.
- Tích hợp AI như một trợ lý tài chính cá nhân.