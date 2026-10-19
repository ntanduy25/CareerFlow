# CareerFlow — Database Entity Relationship Diagram (ERD)

## Sơ đồ quan hệ thực thể

```mermaid
erDiagram
    USERS ||--o{ APPLICATIONS : "owns"
    USERS ||--o{ REMINDERS : "schedules"
    APPLICATIONS ||--o{ APPLICATION_STATUS_HISTORY : "tracks"
    APPLICATIONS ||--o{ REMINDERS : "has"

    USERS {
        uuid id PK "Primary Key (UUIDv4)"
        string email UK "Unique, Indexed"
        string password_hash "Argon2 Hashed"
        string full_name "User Full Name"
        timestamptz created_at "Created Timestamp"
    }

    APPLICATIONS {
        uuid id PK "Primary Key (UUIDv4)"
        uuid user_id FK "References USERS(id) ON DELETE CASCADE"
        string company_name "Company Name"
        string job_title "Job Title"
        text job_url "Job Posting URL (nullable)"
        string status "Status Enum: SAVED, APPLIED, INTERVIEW, OFFER, REJECTED, WITHDRAWN"
        float salary_min "Minimum Salary (nullable)"
        float salary_max "Maximum Salary (nullable)"
        date applied_at "Applied Date (nullable, Indexed)"
        text notes "Personal Notes (nullable)"
        timestamptz created_at "Created Timestamp"
    }

    APPLICATION_STATUS_HISTORY {
        uuid id PK "Primary Key (UUIDv4)"
        uuid application_id FK "References APPLICATIONS(id) ON DELETE CASCADE"
        string old_status "Previous Status (nullable for initial creation)"
        string new_status "Transitioned Status"
        timestamptz changed_at "Timestamp of Status Transition"
    }

    REMINDERS {
        uuid id PK "Primary Key (UUIDv4)"
        uuid user_id FK "References USERS(id) ON DELETE CASCADE"
        uuid application_id FK "References APPLICATIONS(id) ON DELETE CASCADE"
        string title "Interview Round or Action Item"
        timestamptz scheduled_at "Scheduled Event Date & Time"
        boolean completed "Completion Status (default: False)"
        timestamptz created_at "Created Timestamp"
    }
```

## Các ràng buộc và tối ưu hóa

1. **Khóa ngoại & Xóa theo tầng (`ON DELETE CASCADE`)**:
   - Khi xóa một User, toàn bộ `applications` và `reminders` của người dùng đó sẽ tự động được thu hồi.
   - Khi xóa một Application, toàn bộ `application_status_history` và `reminders` gắn với đơn đó sẽ tự động xóa sạch để tránh rác dữ liệu (orphan records).

2. **Chỉ mục (Indexes)**:
   - `users.email`: Đảm bảo tra cứu đăng nhập nhanh O(1) và tính duy nhất.
   - `applications.user_id`: Đảm bảo lọc dữ liệu cô lập theo người dùng (`Multi-tenancy isolation`) với hiệu năng cao.
   - `applications.status`: Tối ưu hóa truy vấn Kanban và thống kê Dashboard.
   - `applications.applied_at`: Tối ưu hóa lọc theo khoảng thời gian.
