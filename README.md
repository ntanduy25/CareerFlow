# CareerFlow 🚀
### Personal Job Application Tracker with AI Resume Analysis

CareerFlow là một ứng dụng Full-stack giúp sinh viên và người tìm việc theo dõi tiến trình ứng tuyển thực tập/việc làm, quản lý lịch phỏng vấn, tối ưu hóa quá trình chuẩn bị hồ sơ và đo lường tỷ lệ chuyển đổi (Conversion Rate) thông qua Dashboard phân tích trực quan.

![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## ✨ Tính năng chính

- 🔐 **Authentication & Authorization**: Đăng ký, đăng nhập bảo mật bằng **Argon2** và **JWT Bearer Token**. Cô lập dữ liệu đa người dùng (Multi-tenancy isolation).
- 📋 **Quản lý đơn ứng tuyển (CRUD & Kanban)**: Theo dõi trạng thái việc làm qua các giai đoạn `SAVED`, `APPLIED`, `INTERVIEW`, `OFFER`, `REJECTED`, `WITHDRAWN`.
- 🕒 **Theo dõi lịch sử trạng thái (Status History)**: Tự động ghi vết dòng thời gian thay đổi trạng thái của từng đơn.
- ⏰ **Nhắc lịch phỏng vấn (Reminders)**: Quản lý lịch phỏng vấn các vòng và danh sách việc cần làm (action items).
- 📊 **Dashboard số liệu thông minh**: Thống kê tỷ lệ phỏng vấn (`Interview Rate`), tỷ lệ nhận offer (`Offer Rate`) và các sự kiện sắp tới.
- 🧪 **Kiểm thử tự động**: Bộ test toàn diện với **Pytest** và tích hợp **GitHub Actions CI**.
- 🐳 **Docker hóa**: Triển khai nhanh chóng với Docker và Docker Compose.

---

## 🛠️ Công nghệ sử dụng

| Tầng | Công nghệ | Mục đích |
| :--- | :--- | :--- |
| **Backend** | Python 3.11, FastAPI, Pydantic v2 | Xây dựng RESTful API, validation dữ liệu tự động |
| **ORM & DB** | SQLAlchemy 2.0, Alembic, PostgreSQL / SQLite | Quản lý schema quan hệ, migration và query tối ưu |
| **Bảo mật** | Argon2-cffi, PyJWT | Băm mật khẩu chuẩn hiện đại, cấp và kiểm tra token |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS | Giao diện tương tác người dùng, Kanban board |
| **Kiểm thử** | Pytest, HTTPX | Kiểm thử tích hợp API, phân quyền và nghiệp vụ |
| **DevOps** | Docker, Docker Compose, GitHub Actions | Chuẩn hóa môi trường chạy và CI/CD tự động |

---

## 🏛️ Kiến trúc & Thiết kế Database

Chi tiết thiết kế được mô tả tại:
- [Kiến trúc hệ thống](docs/architecture.md)
- [Sơ đồ cơ sở dữ liệu ERD](docs/database-erd.md)
- [Quy chuẩn REST API](docs/api-specification.md)

---

## 🚀 Hướng dẫn cài đặt và chạy Local

### Yêu cầu môi trường
- Python 3.11+
- Node.js 18+ (cho Frontend)
- Docker & Docker Compose (tùy chọn)

### 1. Khởi chạy Backend (FastAPI)

```bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Tạo virtual environment và kích hoạt
python -m venv venv
# Trên Windows:
.\venv\Scripts\activate
# Trên Linux/macOS:
source venv/bin/activate

# 3. Cài đặt thư viện
pip install -r requirements.txt

# 4. Sao chép file cấu hình môi trường
cp .env.example .env

# 5. Chạy migration tạo cấu trúc database
alembic upgrade head

# 6. (Tùy chọn) Nạp dữ liệu mẫu để thử nghiệm ngay
python seed.py

# 7. Khởi chạy server FastAPI
uvicorn app.main:app --reload --port 8000
```

Truy cập tài liệu API tương tác tại:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

**Tài khoản demo nạp sẵn (sau khi chạy `seed.py`):**
- **Email:** `demo@careerflow.dev`
- **Mật khẩu:** `password123`

### 2. Khởi chạy Frontend (React + TypeScript + Vite)

```bash
# 1. Mở một tab terminal mới và di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt dependencies (nếu chưa cài)
npm install

# 3. Khởi chạy Vite Dev Server
npm run dev
```

Truy cập giao diện ứng dụng tại:
👉 **`http://localhost:5173`**

*(Frontend đã tích hợp tính năng **1-Click Demo Login** để tự động đăng nhập nhanh tài khoản demo `demo@careerflow.dev`)*

---

## 🧪 Chạy Kiểm thử Backend (Pytest)

```bash
cd backend
.\venv\Scripts\pytest.exe -v
```

Toàn bộ **13/13 test cases** kiểm tra đăng ký, đăng nhập, phân quyền cô lập dữ liệu (Multi-tenancy isolation), chuỗi lịch sử chuyển trạng thái, dashboard và AI skill matching.

---

## 🐳 Khởi chạy Full-stack bằng Docker Compose

```bash
docker-compose up --build -d
```
Ứng dụng hoàn chỉnh sẽ sẵn sàng:
- **Frontend Web UI:** `http://localhost:3000`
- **Backend API Docs:** `http://localhost:8000/docs`
- **PostgreSQL Database:** cổng `5432`

---

## 🗺️ Lộ trình phát triển

- [x] **Phase 1: Backend MVP Core & Security** (FastAPI, SQLAlchemy, Argon2, JWT, SQLite/PostgreSQL)
- [x] **Phase 2: Frontend Modern UI** (React 19, TypeScript, Vite, Tailwind CSS, Kanban Drag-and-Drop, Table List, KPI Dashboard)
- [x] **Phase 3: V1.1 AI Resume Analyzer** (Trích xuất văn bản từ PDF qua `pypdf`, đối chiếu từ khóa kỹ năng với JD, chấm điểm % phù hợp và đưa ra lời khuyên tối ưu)
- [ ] **Phase 4: Triển khai Online** (Frontend trên Vercel, Backend trên Render / Railway, Database trên Supabase)
