from typing import Dict, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.application import (
    Application,
    ApplicationStatus,
    ApplicationStatusHistory,
)
from app.models.reminder import Reminder
from app.schemas.dashboard import DashboardSummary
from app.schemas.reminder import ReminderResponse


class DashboardService:
    @staticmethod
    def get_summary(db: Session, user_id: str) -> DashboardSummary:
        # 1. Total applications
        total = (
            db.query(func.count(Application.id))
            .filter(Application.user_id == user_id)
            .scalar()
            or 0
        )

        # 2. Count by status
        status_counts_raw = (
            db.query(Application.status, func.count(Application.id))
            .filter(Application.user_id == user_id)
            .group_by(Application.status)
            .all()
        )
        counts_dict: Dict[str, int] = {
            s.value: 0 for s in ApplicationStatus
        }
        for st, count in status_counts_raw:
            counts_dict[st] = count

        # 3. Active applications (not REJECTED or WITHDRAWN)
        active = sum(
            counts_dict[s.value]
            for s in ApplicationStatus
            if s not in (ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN)
        )

        # 4. Applications that reached Interview or Offer stage (from status history or current status)
        # Check applications that reached INTERVIEW or OFFER
        interview_apps = (
            db.query(Application.id)
            .join(ApplicationStatusHistory, Application.id == ApplicationStatusHistory.application_id)
            .filter(
                Application.user_id == user_id,
                ApplicationStatusHistory.new_status.in_(
                    [ApplicationStatus.INTERVIEW.value, ApplicationStatus.OFFER.value]
                ),
            )
            .distinct()
            .count()
        )

        offers = counts_dict.get(ApplicationStatus.OFFER.value, 0)

        # Base for conversion: total applications excluding SAVED
        applied_or_more = sum(
            counts_dict[s.value]
            for s in ApplicationStatus
            if s != ApplicationStatus.SAVED
        )

        interview_rate = (
            round((interview_apps / applied_or_more) * 100, 1)
            if applied_or_more > 0
            else 0.0
        )
        offer_rate = (
            round((offers / applied_or_more) * 100, 1)
            if applied_or_more > 0
            else 0.0
        )

        # 5. Upcoming uncompleted reminders
        reminders_query = (
            db.query(Reminder, Application.company_name, Application.job_title)
            .join(Application, Reminder.application_id == Application.id)
            .filter(Reminder.user_id == user_id, Reminder.completed == False)  # noqa: E712
            .order_by(Reminder.scheduled_at.asc())
            .limit(5)
            .all()
        )

        upcoming_reminders: List[ReminderResponse] = []
        for r, comp_name, job_title in reminders_query:
            upcoming_reminders.append(
                ReminderResponse(
                    id=r.id,
                    user_id=r.user_id,
                    application_id=r.application_id,
                    title=r.title,
                    scheduled_at=r.scheduled_at,
                    completed=r.completed,
                    created_at=r.created_at,
                    company_name=comp_name,
                    job_title=job_title,
                )
            )

        return DashboardSummary(
            total_applications=total,
            active_applications=active,
            interviews_count=interview_apps,
            offers_count=offers,
            interview_rate=interview_rate,
            offer_rate=offer_rate,
            by_status=counts_dict,
            upcoming_reminders=upcoming_reminders,
        )
