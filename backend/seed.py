"""
CareerFlow Database Seeder.
Run this script to populate sample applications and reminders for demo purposes.
"""
import sys
from pathlib import Path

# Ensure backend root is in sys.path
backend_dir = str(Path(__file__).resolve().parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from datetime import datetime, date, timedelta, timezone
from app.db.session import SessionLocal
from app.models.user import User
from app.models.application import Application, ApplicationStatus, ApplicationStatusHistory
from app.models.reminder import Reminder
from app.core.security import get_password_hash


def seed():
    db = SessionLocal()
    try:
        # Check if demo user already exists
        demo_email = "demo@careerflow.dev"
        user = db.query(User).filter(User.email == demo_email).first()
        if not user:
            print(f"Creating demo user: {demo_email} ...")
            user = User(
                email=demo_email,
                password_hash=get_password_hash("password123"),
                full_name="Alex Nguyen",
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Remove existing applications for fresh seed
        existing_apps = db.query(Application).filter(Application.user_id == user.id).all()
        if existing_apps:
            print("Cleaning old demo data...")
            for app in existing_apps:
                db.delete(app)
            db.commit()

        sample_apps = [
            {
                "company_name": "Shopee Vietnam",
                "job_title": "Backend Software Engineer Intern (Python/Go)",
                "job_url": "https://careers.shopee.vn/job/backend-intern",
                "status": ApplicationStatus.OFFER.value,
                "salary_min": 18000000,
                "salary_max": 22000000,
                "applied_at": date.today() - timedelta(days=25),
                "notes": "Completed 2 technical interview rounds and HR discussion. Received official offer letter!",
                "history": [
                    (None, ApplicationStatus.APPLIED.value, timedelta(days=25)),
                    (ApplicationStatus.APPLIED.value, ApplicationStatus.INTERVIEW.value, timedelta(days=14)),
                    (ApplicationStatus.INTERVIEW.value, ApplicationStatus.OFFER.value, timedelta(days=3)),
                ],
                "reminders": [
                    ("Review offer letter & contract terms", timedelta(days=2), False),
                ],
            },
            {
                "company_name": "VNG Corporation",
                "job_title": "Fullstack Developer Intern (FastAPI + React)",
                "job_url": "https://careers.vng.com.vn/job/fullstack-intern",
                "status": ApplicationStatus.INTERVIEW.value,
                "salary_min": 15000000,
                "salary_max": 18000000,
                "applied_at": date.today() - timedelta(days=15),
                "notes": "Passed online assessment test. Upcoming System Design & Coding interview.",
                "history": [
                    (None, ApplicationStatus.APPLIED.value, timedelta(days=15)),
                    (ApplicationStatus.APPLIED.value, ApplicationStatus.INTERVIEW.value, timedelta(days=5)),
                ],
                "reminders": [
                    ("Round 2 Live Coding Interview (FastAPI & Database)", timedelta(days=1), False),
                    ("Prepare self-introduction & project portfolio", timedelta(hours=18), False),
                ],
            },
            {
                "company_name": "FPT Software",
                "job_title": "Python AI & Cloud Intern",
                "job_url": "https://fptsoftware.com/careers/ai-intern",
                "status": ApplicationStatus.APPLIED.value,
                "salary_min": 12000000,
                "salary_max": 15000000,
                "applied_at": date.today() - timedelta(days=7),
                "notes": "Applied through University Job Fair 2026. Waiting for HR screening feedback.",
                "history": [
                    (None, ApplicationStatus.APPLIED.value, timedelta(days=7)),
                ],
                "reminders": [
                    ("Send follow-up email to HR recruiter", timedelta(days=4), False),
                ],
            },
            {
                "company_name": "Grab",
                "job_title": "Software Engineer Intern - Core Services",
                "job_url": "https://grab.careers/jobs/swe-intern",
                "status": ApplicationStatus.SAVED.value,
                "salary_min": 20000000,
                "salary_max": 25000000,
                "applied_at": None,
                "notes": "Requirement mentions Docker, PostgreSQL, RESTful APIs. Need to polish CV before submitting.",
                "history": [
                    (None, ApplicationStatus.SAVED.value, timedelta(days=2)),
                ],
                "reminders": [
                    ("Tailor resume for Grab job requirements", timedelta(days=1), False),
                ],
            },
            {
                "company_name": "Momo (M_Service)",
                "job_title": "Backend Engineer Intern",
                "job_url": "https://momo.vn/careers",
                "status": ApplicationStatus.REJECTED.value,
                "salary_min": 14000000,
                "salary_max": 16000000,
                "applied_at": date.today() - timedelta(days=40),
                "notes": "Position required 3rd year student with Kafka experience. Keep learning and reapply next batch.",
                "history": [
                    (None, ApplicationStatus.APPLIED.value, timedelta(days=40)),
                    (ApplicationStatus.APPLIED.value, ApplicationStatus.REJECTED.value, timedelta(days=20)),
                ],
                "reminders": [],
            },
        ]

        print("Seeding applications, status history, and reminders...")
        for item in sample_apps:
            app = Application(
                user_id=user.id,
                company_name=item["company_name"],
                job_title=item["job_title"],
                job_url=item["job_url"],
                status=item["status"],
                salary_min=item["salary_min"],
                salary_max=item["salary_max"],
                applied_at=item["applied_at"],
                notes=item["notes"],
                created_at=datetime.now(timezone.utc) - timedelta(days=10),
            )
            db.add(app)
            db.flush()

            # Status history
            for old_st, new_st, delta in item["history"]:
                history = ApplicationStatusHistory(
                    application_id=app.id,
                    old_status=old_st,
                    new_status=new_st,
                    changed_at=datetime.now(timezone.utc) - delta,
                )
                db.add(history)

            # Reminders
            for title, time_offset, completed in item["reminders"]:
                reminder = Reminder(
                    user_id=user.id,
                    application_id=app.id,
                    title=title,
                    scheduled_at=datetime.now(timezone.utc) + time_offset,
                    completed=completed,
                )
                db.add(reminder)

        db.commit()
        print("Done! Demo account:")
        print(f"  Email:    {demo_email}")
        print("  Password: password123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
