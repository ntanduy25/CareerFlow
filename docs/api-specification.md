# CareerFlow — API Specification (v1)

Tất cả các endpoint nghiệp vụ đều có tiền tố `/api/v1`. Các endpoint yêu cầu quyền riêng tư phải đính kèm Header:
`Authorization: Bearer <access_token>`

## 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Yêu cầu Auth | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Không | Đăng ký tài khoản mới (email, password >= 6 ký tự, full_name) |
| `POST` | `/api/v1/auth/login` | Không | Đăng nhập nhận JWT Token |
| `GET` | `/api/v1/auth/me` | Có | Xem thông tin hồ sơ của người dùng hiện tại |

## 2. Applications (`/api/v1/applications`)

| Method | Endpoint | Yêu cầu Auth | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/applications` | Có | Lấy danh sách đơn (hỗ trợ `status`, `search`, `skip`, `limit`) |
| `POST` | `/api/v1/applications` | Có | Tạo mới đơn ứng tuyển (tự động ghi lịch sử trạng thái ban đầu) |
| `GET` | `/api/v1/applications/{id}` | Có | Xem chi tiết đơn bao gồm toàn bộ lịch sử trạng thái và lịch hẹn |
| `PATCH` | `/api/v1/applications/{id}` | Có | Chỉnh sửa thông tin đơn ứng tuyển |
| `PATCH` | `/api/v1/applications/{id}/status` | Có | Kéo thả Kanban / Cập nhật trạng thái và ghi log chuyển đổi |
| `DELETE` | `/api/v1/applications/{id}` | Có | Xóa đơn ứng tuyển |
| `GET` | `/api/v1/applications/{id}/history` | Có | Lấy danh sách lịch sử chuyển đổi trạng thái của đơn |

## 3. Reminders (`/api/v1/reminders`)

| Method | Endpoint | Yêu cầu Auth | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reminders` | Có | Danh sách lịch hẹn/phỏng vấn sắp tới của user |
| `POST` | `/api/v1/reminders` | Có | Tạo lịch hẹn mới gắn với đơn ứng tuyển |
| `PATCH` | `/api/v1/reminders/{id}` | Có | Cập nhật lịch hẹn hoặc đánh dấu hoàn thành (`completed: true`) |
| `DELETE` | `/api/v1/reminders/{id}` | Có | Xóa lịch hẹn |

## 4. Dashboard (`/api/v1/dashboard`)

| Method | Endpoint | Yêu cầu Auth | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/dashboard/summary` | Có | Lấy số liệu thống kê tổng hợp, tỷ lệ phỏng vấn/offer và các lịch hẹn gần nhất |
